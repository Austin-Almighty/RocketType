"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WordsDisplay from "./WordsDisplay";
import { Clock } from "../Clock";
import WordCounter from "../WordCounter";
import { useGameContext, TrackRecord } from "../../_lib/gameContext";
import { useUser } from "../../_lib/userContext";
import resultToDB from "../../_lib/resultToFirebase";
import { completedWords, createTypingState, typingReducer } from "../../_lib/typing/engine";
import { getRandomWords, wordListFor } from "../../_lib/typing/words";
import { buildRecord, computeWpm } from "../../_lib/typing/stats";
import { useTypingInput } from "../../_lib/typing/useTypingInput";

// Rocket Run keeps topping up words so fast typists never run out.
const TIMED_BATCH = 100;
const TIMED_REFILL_AT = 40;

type TypingTestProps = {
  onFocusChange?: (focused: boolean) => void;
};

export default function TypingTest({ onFocusChange }: TypingTestProps) {
  const { gameMode, setGameMode, setTrackBySecond } = useGameContext();
  const { user } = useUser();
  const router = useRouter();
  const isTimed = gameMode.mode === "Rocket Run";

  const [state, dispatch] = useReducer(typingReducer, undefined, () =>
    createTypingState(
      getRandomWords(wordListFor(gameMode.words), isTimed ? TIMED_BATCH : gameMode.count ?? 30)
    )
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveWpm, setLiveWpm] = useState<number | null>(null);
  const [focused, setFocused] = useState(true);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stateRef = useRef(state);
  const recordsRef = useRef<TrackRecord[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Ends the test exactly once, using the records collected so far plus
  // a final record for the partial last second.
  const endTest = useCallback(() => {
    if (endedRef.current || startedAtRef.current === null) return;
    endedRef.current = true;

    const { keyCount, mistakes } = stateRef.current;
    const records = [...recordsRef.current];
    const previous = records[records.length - 1];
    const exactSeconds = (performance.now() - startedAtRef.current) / 1000;
    const finalSeconds = isTimed
      ? gameMode.time ?? exactSeconds
      : Math.round(exactSeconds * 100) / 100;
    if (!previous || finalSeconds > previous.elapsedSeconds) {
      records.push(buildRecord(keyCount, mistakes, finalSeconds, previous));
    }

    setTrackBySecond(records);
    setGameMode((prev) => ({ ...prev, start: false }));
    if (user) resultToDB({ trackBySecond: records, gameMode, user });
    router.push("/result");
  }, [gameMode, isTimed, router, setGameMode, setTrackBySecond, user]);

  const endTestRef = useRef(endTest);
  useEffect(() => {
    endTestRef.current = endTest;
  }, [endTest]);

  // One clock for everything: started on the first keystroke, it records
  // stats each second and ends Rocket Run when time is up. It depends only
  // on `state.started` so nothing else can restart or cancel it mid-test.
  const timeLimit = isTimed ? gameMode.time : null;
  useEffect(() => {
    if (!state.started) return;
    startedAtRef.current = performance.now();

    let second = 0;
    const timer = setInterval(() => {
      second += 1;
      if (timeLimit && second >= timeLimit) {
        clearInterval(timer);
        endTestRef.current();
        return;
      }
      const { keyCount, mistakes } = stateRef.current;
      const previous = recordsRef.current[recordsRef.current.length - 1];
      recordsRef.current = [...recordsRef.current, buildRecord(keyCount, mistakes, second, previous)];
      setElapsedSeconds(second);
      setLiveWpm(computeWpm(keyCount, mistakes, second));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.started]);

  // Star Count ends when the final word is done.
  useEffect(() => {
    if (state.finished) endTest();
  }, [state.finished, endTest]);

  useEffect(() => {
    if (!isTimed) return;
    if (state.words.length - state.wordIndex < TIMED_REFILL_AT) {
      dispatch({ type: "appendWords", words: getRandomWords(wordListFor(gameMode.words), TIMED_BATCH) });
    }
  }, [isTimed, state.wordIndex, state.words.length, gameMode.words]);

  useTypingInput(inputRef, {
    onChar: (char) => dispatch({ type: "char", char }),
    onSpace: () => dispatch({ type: "space" }),
    onBackspace: () => dispatch({ type: "backspace" }),
    onDeleteWord: () => dispatch({ type: "deleteWord" }),
  });

  // Typing anywhere refocuses the hidden input.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
    function refocus(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Tab") return;
      inputRef.current?.focus({ preventScroll: true });
    }
    document.addEventListener("keydown", refocus);
    return () => document.removeEventListener("keydown", refocus);
  }, []);

  function handleFocus(next: boolean) {
    setFocused(next);
    onFocusChange?.(next);
  }

  const remaining = isTimed && gameMode.time ? gameMode.time - elapsedSeconds : null;

  return (
    <div className="relative w-full text-base-content">
      <div className="flex items-baseline gap-6 mb-4 h-12 font-mono text-3xl sm:text-4xl text-primary">
        {isTimed ? (
          <Clock seconds={remaining} />
        ) : (
          <WordCounter complete={completedWords(state)} />
        )}
        <span
          className={`text-xl sm:text-2xl text-base-content/50 transition-opacity duration-300 ${
            liveWpm === null ? "opacity-0" : "opacity-100"
          }`}
        >
          {liveWpm ?? 0} wpm
        </span>
      </div>

      <div className="relative cursor-text" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
        <WordsDisplay state={state} focused={focused} />
        {!focused && (
          <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl text-base-content">
            Click or press any key to focus
          </div>
        )}
      </div>

      <textarea
        ref={inputRef}
        aria-label="Typing input"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onFocus={() => handleFocus(true)}
        onBlur={() => handleFocus(false)}
        className="absolute opacity-0 pointer-events-none w-px h-px top-0 left-0 resize-none"
      />
    </div>
  );
}
