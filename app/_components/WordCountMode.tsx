"use client";

import { useRef, useEffect, useState, forwardRef } from "react";
import { useGameContext } from "../_lib/gameContext";
import { top250Words, top1kWords, top5kWords } from "../_ui/words";

function getRandomWords(words: string[], count: number): string[] {
  // Fisher-Yates shuffle
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedWords = shuffled.slice(0, count);
  const fullString = selectedWords.join(" ");
  return fullString.split(""); // char array
}

function assignRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") ref(value);
      else (ref as React.RefObject<T>).current = value;
    });
  };
}

type WordCountModeProps = {
  setMistakes: React.Dispatch<React.SetStateAction<number>>;
  onTestEnd: () => void;
  setCompleteWords: React.Dispatch<React.SetStateAction<number>>; // <-- add this
};

const WordCountMode = forwardRef<HTMLTextAreaElement, WordCountModeProps>(
  function WordCountMode({ setMistakes, onTestEnd, setCompleteWords }, ref) {
    const { gameMode } = useGameContext();
    const textRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentCharRef = useRef<HTMLSpanElement>(null);

    const [characters, setCharacters] = useState<string[]>([]);
    const [userInput, setUserInput] = useState("");
    const [testFinished, setTestFinished] = useState(false);

    // Generate word set based on gameMode.words and gameMode.count
    useEffect(() => {
      let sourceWords: string[] = [];
      if (gameMode.words === "1k") sourceWords = top1kWords;
      else if (gameMode.words === "5k") sourceWords = top5kWords;
      else sourceWords = top250Words;
      const count = gameMode.count ?? 30;
      setCharacters(getRandomWords(sourceWords, count));
      setUserInput(""); // Reset input
      setTestFinished(false);
    }, [gameMode.words, gameMode.count]);

    // Focus behavior
    useEffect(() => {
      if (textRef.current) textRef.current.focus({ preventScroll: true });
      function focusOnInput() {
        if (textRef.current) textRef.current.focus({ preventScroll: true });
      }
      document.addEventListener("keypress", focusOnInput);
      return () => {
        document.removeEventListener("keypress", focusOnInput);
      };
    }, []);

    // Scrolling caret into view
    useEffect(() => {
      if (!containerRef.current || !currentCharRef.current) return;
      const container = containerRef.current;
      const currentChar = currentCharRef.current;
      const lineHeight = 60;
      const caretLine = Math.round(currentChar.offsetTop / lineHeight);
      if (caretLine < 2) {
        container.scrollTop = 0;
      } else {
        container.scrollTop = (caretLine - 1) * lineHeight;
      }
    }, [userInput]);

    // Track mistakes
    useEffect(() => {
      const mistakeCount = userInput.split("").reduce((acc, char, idx) => {
        if (idx >= characters.length) return acc;
        return char !== characters[idx] ? acc + 1 : acc;
      }, 0);
      setMistakes(mistakeCount);
    }, [userInput, setMistakes, characters]);

    // End test if finished
    useEffect(() => {
      if (
        !testFinished &&
        userInput.length === characters.length &&
        characters.length > 0
      ) {
        setTestFinished(true);
        onTestEnd();
      }
    }, [userInput, characters, onTestEnd, testFinished]);

    return (
      <div className="relative w-full bg-base-100 text-base-content text-5xl">
        <div
          ref={containerRef}
          className="text-display max-h-[11.25rem] leading-15 text-5xl overflow-hidden"
          onWheel={(e) => e.preventDefault()}
        >
          {characters.map((char, idx) => {
            let className = "";
            if (idx < userInput.length) {
              className = char === userInput[idx] ? "correct" : "incorrect";
            } else if (idx === userInput.length) {
              className = "current";
            }
            return (
              <span
                key={idx}
                className={className}
                ref={idx === userInput.length ? currentCharRef : null}
              >
                {char}
              </span>
            );
          })}
        </div>
        <textarea
          ref={assignRefs(textRef, ref)}
          value={userInput}
          onChange={(e) => {
            const value = e.target.value;
            // Optional: restrict max length to char length
            if (value.length > characters.length) return;
            // Handle mistake increment (if you want instant feedback)
            const prevLength = userInput.length;
            const nextLength = value.length;
            let newMistakes = 0;
            if (nextLength > prevLength) {
              const newChar = value[value.length - 1];
              const expectedChar = characters[prevLength];
              if (newChar !== expectedChar) {
                newMistakes = 1;
              }
            }
            setMistakes((prev) => prev + newMistakes);
            setUserInput(value);
            // Find index of each space in the target characters array
            let completed = 0;
            let charIdx = 0;
            while (charIdx < value.length && charIdx < characters.length) {
              // If the current character in the target is a space, and the user has typed up to/including it,
              // count the word as done.
              if (characters[charIdx] === " ") {
                completed += 1;
              }
              charIdx += 1;
            }
            // If the user has finished all characters, count the last word as well
            if (value.length === characters.length && characters.length > 0) {
              completed += 1;
            }
            setCompleteWords(completed);
          }}
          className="typing-input opacity-0 -z-50 h-0 w-0"
        />
      </div>
    );
  }
);

export default WordCountMode;
