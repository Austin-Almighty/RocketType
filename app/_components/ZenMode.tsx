"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { isInteractiveTarget } from "../_lib/keyboard";
import WordCounter from "./WordCounter";
import ZenSky, { ZenSkyHandle } from "./zen/ZenSky";

// Free typing with no target text and no score. It never ends on its own;
// the starfield behind it reacts to every keystroke.
export default function ZenMode() {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const skyRef = useRef<ZenSkyHandle>(null);

  const [userInput, setUserInput] = useState("");
  const [offset, setOffset] = useState(0);

  const completeWords = userInput.split(/\s+/).filter((w) => /^[a-zA-Z]+$/.test(w)).length;

  useEffect(() => {
    textRef.current?.focus({ preventScroll: true });
    function focusOnInput(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1 || isInteractiveTarget(e.target) || document.querySelector("dialog[open]")) return;
      textRef.current?.focus({ preventScroll: true });
    }
    document.addEventListener("keydown", focusOnInput);
    return () => document.removeEventListener("keydown", focusOnInput);
  }, []);

  // Keep the caret's line as the last of three visible lines.
  useLayoutEffect(() => {
    const caret = caretRef.current;
    if (!caret) return;
    const lineHeight = caret.offsetHeight;
    const line = Math.round(caret.offsetTop / lineHeight);
    setOffset(Math.max(0, line - 2) * lineHeight);
  }, [userInput]);

  function handleChange(value: string) {
    if (value.length > userInput.length) {
      const added = value.slice(userInput.length);
      for (const char of added) {
        if (char === " " || char === "\n") skyRef.current?.word();
        else skyRef.current?.keystroke();
      }
    }
    setUserInput(value);
  }

  return (
    <>
      <ZenSky ref={skyRef} />
      <div className="relative z-10 w-full text-base-content">
        <div className="flex items-baseline gap-6 mb-4 h-12 font-mono text-3xl sm:text-4xl text-primary">
          <WordCounter complete={completeWords} />
        </div>
        <div
          ref={containerRef}
          className="typing-viewport zen-viewport relative overflow-hidden cursor-text"
          onClick={() => textRef.current?.focus({ preventScroll: true })}
        >
          <div
            className="typing-words zen-text whitespace-pre-wrap break-words transition-transform duration-150 ease-out"
            style={{ transform: `translateY(-${offset}px)` }}
          >
            {userInput}
            <span ref={caretRef} aria-hidden className="zen-caret" />
          </div>
        </div>
        <textarea
          ref={textRef}
          data-typing-input
          aria-label="Zen typing input"
          value={userInput}
          onChange={(e) => handleChange(e.target.value)}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="absolute opacity-0 pointer-events-none w-px h-px top-0 left-0 resize-none"
        />
      </div>
    </>
  );
}
