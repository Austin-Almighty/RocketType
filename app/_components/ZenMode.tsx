"use client";

import { useRef, useEffect, useState, forwardRef } from "react";

type ZenModeProps = {
  setCompleteWords: React.Dispatch<React.SetStateAction<number>>;
  onTestEnd?: () => void;
};

function assignRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") ref(value);
      else (ref as React.RefObject<T>).current = value;
    });
  };
}

const ZenMode = forwardRef<HTMLTextAreaElement, ZenModeProps>(
  function ZenMode({ setCompleteWords }, ref) {
    const textRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const caretRef = useRef<HTMLSpanElement>(null);

    const [userInput, setUserInput] = useState("");

    // Update word count as user types
    useEffect(() => {
      const words = userInput
        .trim()
        .split(/\s+/)
        .filter((w) => /^[a-zA-Z]+$/.test(w));
      setCompleteWords(words.length);
    }, [userInput, setCompleteWords]);

    // Focus textarea logic
    useEffect(() => {
      if (textRef.current) textRef.current.focus({ preventScroll: true });
      function focusOnInput() {
        if (textRef.current) textRef.current.focus({ preventScroll: true });
      }
      document.addEventListener("keypress", focusOnInput);
      return () => document.removeEventListener("keypress", focusOnInput);
    }, []);

    // Scroll caret into view, keep last 3 lines visible
    useEffect(() => {
      if (!containerRef.current || !caretRef.current) return;
      const container = containerRef.current;
      const caret = caretRef.current;
      const lineHeight = 60; // px, should match your line height
      const caretLine = Math.round(caret.offsetTop / lineHeight);
      if (caretLine < 2) {
        container.scrollTop = 0;
      } else {
        container.scrollTop = (caretLine - 1) * lineHeight;
      }
    }, [userInput]);

    // Render each character as a span, with a blinking caret after last char
    const chars = userInput.split("");

    return (
      <div className="relative w-full bg-base-100 text-base-content text-5xl">
        <div
          ref={containerRef}
          className="text-display max-h-[11.25rem] min-h-[11.25rem] leading-15 text-5xl overflow-hidden"
          onWheel={(e) => e.preventDefault()}
        >
          {chars.map((char, idx) => (
            <span
              key={idx}
              className="user-typed" // Use your main span class, or blank if you want
            >
              {char}
            </span>
          ))}
          {/* Blinking caret after last character */}
          <span
            ref={caretRef}
            className="inline-block w-2 h-10 bg-blue-950 align-bottom animate-pulse"
          ></span>
        </div>
        <textarea
          ref={assignRefs(textRef, ref)}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="typing-input opacity-0 -z-50 h-0 w-0"
          autoFocus
        />
      </div>
    );
  }
);

export default ZenMode;