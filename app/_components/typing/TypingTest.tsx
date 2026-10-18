"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WordsDisplay from "./WordsDisplay";
import { Clock } from "../Clock";
import WordCounter from "../WordCounter";
import { useGameContext, type TrackRecord } from "../../_lib/gameContext";
import { useUser } from "../../_lib/userContext";
import { getPersonalBest } from "../../_lib/getResults";
import { characterStats, completedWords, createTypingState, typingReducer, type TypingAction } from "../../_lib/typing/engine";
import { getRandomWords, wordListFor } from "../../_lib/typing/words";
import { buildRecord, computeRaw, elapsedTestSeconds, SCORING_VERSION } from "../../_lib/typing/stats";
import { useTypingInput } from "../../_lib/typing/useTypingInput";
import { isInteractiveTarget } from "../../_lib/keyboard";
import { verifiedBackendEnabled, createVerifiedTest, beginVerifiedTest, type VerifiedTest, type TestEvent } from "../../_lib/verifiedTests";
import { matchingResults } from "../../_lib/results";

const TIMED_BATCH = 100;
const TIMED_REFILL_AT = 40;

export default function TypingTest() {
  const { gameMode, setGameMode, setTrackBySecond, setTestDetails, practiceWords, saveResult, savedResults } = useGameContext();
  const { user } = useUser();
  const [player] = useState(user);
  const [settings] = useState(() => ({ ...gameMode }));
  const [practice] = useState(practiceWords);
  const needsVerification = verifiedBackendEnabled && Boolean(player);
  const [testID] = useState(() => crypto.randomUUID());
  const [verifiedTest, setVerifiedTest] = useState<VerifiedTest | null>(null);
  const verifiedTestRef = useRef<VerifiedTest | null>(null);
  const proofEvents = useRef<TestEvent[]>([]);
  const [preparationError, setPreparationError] = useState(false);
  const [preparationAttempt, setPreparationAttempt] = useState(0);
  const [startWarning, setStartWarning] = useState(false);
  const [sessionResults] = useState(() => savedResults
    .filter((entry) => entry.result.userUID === player?.uid)
    .map((entry) => ({ ...entry.result, createdAt: null })));
  const isTimed = !practice && settings.mode === "Rocket Run";
  const timeLimit = isTimed ? settings.time : null;
  const router = useRouter();
  const [state, setState] = useState(() => createTypingState(practice ??
    getRandomWords(wordListFor(settings.words), isTimed ? TIMED_BATCH : settings.count ?? 50)));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveWpm, setLiveWpm] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stateRef = useRef(state);
  const recordsRef = useRef<TrackRecord[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const previousBestRef = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    if (!needsVerification) return;
    let cancelled = false;
    setPreparationError(false);
    createVerifiedTest(testID, settings, practice).then((session) => {
      if (cancelled) return;
      verifiedTestRef.current = session;
      const initial = createTypingState(session.targets);
      stateRef.current = initial;
      setState(initial);
      setVerifiedTest(session);
      if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    }).catch((error) => {
      console.error("Could not prepare verified test", error);
      if (!cancelled) setPreparationError(true);
    });
    return () => { cancelled = true; };
  }, [needsVerification, testID, settings, practice, preparationAttempt]);

  useEffect(() => {
    if (!player || practice) return;
    let cancelled = false;
    getPersonalBest(player.uid, settings)
      .then((best) => {
        if (cancelled) return;
        // A previous test may still be saving when the next one starts.
        const earlier = matchingResults(sessionResults, settings);
        previousBestRef.current = earlier.length
          ? Math.max(best ?? 0, ...earlier.map((result) => result.wpm)) : best;
      })
      .catch((error) => console.error("Failed to load personal best", error));
    return () => { cancelled = true; };
  }, [player, practice, sessionResults, settings]);

  const endTest = useCallback(() => {
    if (endedRef.current || startedAtRef.current === null) return;
    endedRef.current = true;
    const current = stateRef.current;
    const exactSeconds = elapsedTestSeconds(startedAtRef.current, performance.now(), timeLimit);
    const finalSeconds = timeLimit ?? Math.max(0.001, exactSeconds);
    const records = [...recordsRef.current];
    const previous = records[records.length - 1];
    const final = buildRecord(current, finalSeconds, previous);
    if (previous?.elapsedSeconds === finalSeconds) records[records.length - 1] = final;
    else records.push(final);

    const characters = characterStats(current);
    const previousBest = previousBestRef.current;
    const resultID = verifiedTestRef.current?.id ?? crypto.randomUUID();
    const completedAt = Date.now();
    const testKind = practice ? "practice" : "standard";
    setTestDetails({
      settings, resultID, completedAt, testKind, characters, missedWords: current.missedWords,
      personalBest: player && !practice && previousBest !== undefined
        ? { previous: previousBest, isNew: previousBest === null || final.wpm > previousBest } : null,
    });
    setTrackBySecond(records);
    setGameMode((prev) => ({ ...prev, start: false }));
    if (player) void saveResult({
      ...(verifiedTestRef.current ? { proof: { sessionID: verifiedTestRef.current.id, events: proofEvents.current } } : {}),
      id: resultID, completedAt, userUID: player.uid, userDisplayName: player.displayName,
      gameMode: settings.mode!, time: settings.time, count: settings.count, words: settings.words,
      testKind, scoringVersion: SCORING_VERSION, elapsedSeconds: finalSeconds, characters,
      keyCount: current.keyCount, errors: current.mistakes, wpm: final.wpm,
      raw: computeRaw(current.keyCount, finalSeconds),
      accuracy: current.keyCount ? Math.round((current.keyCount - current.mistakes) / current.keyCount * 1000) / 10 : 0,
    });
    router.push("/result");
  }, [player, practice, router, saveResult, setGameMode, setTestDetails, setTrackBySecond, settings, timeLimit]);

  useEffect(() => {
    if (!state.started) return;
    const timer = setInterval(() => {
      if (endedRef.current || startedAtRef.current === null) return;
      const seconds = elapsedTestSeconds(startedAtRef.current, performance.now(), timeLimit);
      if (timeLimit !== null && seconds >= timeLimit) { endTest(); return; }
      setElapsedSeconds(Math.floor(seconds));
      const previous = recordsRef.current[recordsRef.current.length - 1];
      if (Math.floor(seconds) < 1 || Math.floor(seconds) <= Math.floor(previous?.elapsedSeconds ?? 0)) return;
      const record = buildRecord(stateRef.current, seconds, previous);
      recordsRef.current.push(record);
      setLiveWpm(record.wpm);
    }, 100);
    return () => clearInterval(timer);
  }, [state.started, endTest, timeLimit]);

  function apply(action: TypingAction) {
    if (endedRef.current || (needsVerification && !verifiedTestRef.current)) return;
    const now = performance.now();
    if (startedAtRef.current !== null && timeLimit !== null && elapsedTestSeconds(startedAtRef.current, now, timeLimit) >= timeLimit) {
      endTest();
      return;
    }
    let next = typingReducer(stateRef.current, action);
    if (next === stateRef.current) return;
    if (next.started && startedAtRef.current === null) {
      startedAtRef.current = now;
      if (verifiedTestRef.current) void beginVerifiedTest(verifiedTestRef.current.id).catch((error) => {
        console.error("Could not start server clock", error);
        setStartWarning(true);
      });
    }
    if (verifiedTestRef.current && startedAtRef.current !== null && action.type !== "appendWords") {
      proofEvents.current.push({ ...action, ms: now - startedAtRef.current });
    }
    if (isTimed && !needsVerification && next.words.length - next.wordIndex < TIMED_REFILL_AT) {
      next = typingReducer(next, { type: "appendWords", words: getRandomWords(wordListFor(settings.words), TIMED_BATCH) });
    }
    // Input events may batch several letters before React commits.
    stateRef.current = next;
    setState(next);
    if (next.finished) endTest();
  }

  useTypingInput(inputRef, {
    onChar: (char) => apply({ type: "char", char }),
    onSpace: () => apply({ type: "space" }),
    onBackspace: () => apply({ type: "backspace" }),
    onDeleteWord: () => apply({ type: "deleteWord" }),
  });

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    function refocus(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1 ||
        isInteractiveTarget(e.target) || document.querySelector("dialog[open]")) return;
      inputRef.current?.focus({ preventScroll: true });
    }
    document.addEventListener("keydown", refocus);
    return () => document.removeEventListener("keydown", refocus);
  }, []);

  return (
    <div className="relative w-full text-base-content">
      {needsVerification && !verifiedTest && <div role={preparationError ? "alert" : "status"} className="p-4 bg-base-200 rounded-xl mb-4">
        {preparationError ? <>Couldn’t prepare your verified test. Check your connection. <button type="button" className="btn btn-sm" onClick={() => setPreparationAttempt((attempt) => attempt + 1)}>Try again</button></> : "Preparing your verified test…"}
      </div>}
      {startWarning && <p role="status">Couldn’t confirm the server clock. Keep this tab open and check your connection before retrying the save.</p>}
      {practice && <p className="mb-3 text-sm text-base-content">Missed-word practice · Unranked · {completedWords(state)}/{state.words.length} words</p>}
      <div className="flex items-baseline gap-6 mb-4 h-12 font-mono tabular-nums text-3xl sm:text-4xl text-base-content">
        {isTimed ? <Clock seconds={Math.max(0, (timeLimit ?? 0) - elapsedSeconds)} />
          : practice ? <span>{completedWords(state)}/{state.words.length}</span>
            : <WordCounter complete={completedWords(state)} />}
        <span className="text-xl sm:text-2xl text-base-content/90">{liveWpm !== null ? liveWpm + " wpm" : ""}</span>
      </div>
      <div className={needsVerification && !verifiedTest ? "invisible" : "relative cursor-text"} onClick={() => inputRef.current?.focus({ preventScroll: true })}>
        <WordsDisplay state={state} focused={focused} />
        {!focused && <button
          type="button"
          className="absolute inset-0 w-full flex items-center justify-center text-lg text-base-content"
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >Tap or click to type</button>}
      </div>
      <textarea
        ref={inputRef}
        data-typing-input
        aria-label="Typing input"
        disabled={needsVerification && !verifiedTest}
        autoCapitalize="off"
        autoComplete="off"

        autoCorrect="off"
        spellCheck={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}

        className="absolute opacity-0 pointer-events-none w-px h-px top-0 left-0 resize-none"
      />
    </div>
  );
}
