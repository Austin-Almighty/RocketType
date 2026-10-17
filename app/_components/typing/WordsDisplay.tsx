"use client";
import { useLayoutEffect, useRef, useState } from "react";
import Word from "./Word";
import { TypingState, wordHasError } from "../../_lib/typing/engine";

const VISIBLE_LINES = 3;

type Caret = { left: number; top: number; height: number };

type WordsDisplayProps = {
  state: TypingState;
  focused: boolean;
};

// Renders the words, a caret that glides between letters, and scrolls so
// the active line stays on the second visible row.
export default function WordsDisplay({ state, focused }: WordsDisplayProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [caret, setCaret] = useState<Caret | null>(null);
  const [offset, setOffset] = useState(0);
  const [lineHeight, setLineHeight] = useState<number | null>(null);

  const { wordIndex, typed } = state;
  const currentTyped = typed[wordIndex] ?? "";

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    function measure() {
      const wordEl = inner!.querySelector<HTMLElement>(`[data-word="${wordIndex}"]`);
      if (!wordEl) return;
      const letters = wordEl.querySelectorAll<HTMLElement>(".typing-letter");
      const height = wordEl.offsetHeight;
      setLineHeight(height);

      // Letters and words share `inner` as their offsetParent, so their
      // offsets are directly comparable.
      let left = wordEl.offsetLeft;
      if (currentTyped.length < letters.length) {
        left = letters[currentTyped.length].offsetLeft;
      } else if (letters.length > 0) {
        const last = letters[letters.length - 1];
        left = last.offsetLeft + last.offsetWidth;
      }
      setCaret({ left, top: wordEl.offsetTop, height });

      const line = Math.round(wordEl.offsetTop / height);
      setOffset(Math.max(0, line - 1) * height);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [wordIndex, currentTyped, state.words.length]);

  return (
    <div
      className={`typing-viewport relative overflow-hidden transition-[filter,opacity] duration-200 ${
        focused ? "" : "blur-[3px] opacity-60"
      }`}
      style={lineHeight ? { height: lineHeight * VISIBLE_LINES } : undefined}
    >
      <div
        ref={innerRef}
        className="typing-words relative transition-transform duration-150 ease-out"
        style={{ transform: `translateY(-${offset}px)` }}
      >
        {caret && (
          <span
            aria-hidden
            className={`typing-caret ${state.started ? "" : "typing-caret-idle"}`}
            style={{
              transform: `translate(${caret.left}px, ${caret.top + caret.height * 0.15}px)`,
              height: caret.height * 0.7,
            }}
          />
        )}
        {state.words.map((word, i) => (
          <Word
            key={i}
            index={i}
            target={word}
            typed={typed[i] ?? ""}
            isActive={i === wordIndex}
            hasError={wordHasError(state, i)}
          />
        ))}
      </div>
    </div>
  );
}
