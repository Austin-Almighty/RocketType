"use client";
import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

export type TypingInputHandlers = {
  onChar: (char: string) => void;
  onSpace: () => void;
  onBackspace: () => void;
  onDeleteWord: () => void;
};

// The textarea always holds one placeholder character so that Backspace
// has something to delete and still fires a beforeinput event.
const SENTINEL = " ";

// Reads keystrokes from a hidden textarea through `beforeinput`, which
// works for hardware keyboards and mobile virtual keyboards alike
// (mobile keydown events often report key "Unidentified").
export function useTypingInput(
  inputRef: RefObject<HTMLTextAreaElement | null>,
  handlers: TypingInputHandlers
) {
  const handlersRef = useRef(handlers);
  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    let isComposing = false;

    function resetValue() {
      input!.value = SENTINEL;
      input!.setSelectionRange(SENTINEL.length, SENTINEL.length);
    }
    resetValue();

    function emitText(text: string) {
      for (const char of text) {
        if (char === " ") handlersRef.current.onSpace();
        else if (char !== "\n" && char !== "\r") handlersRef.current.onChar(char);
      }
    }

    function handleBeforeInput(e: InputEvent) {
      switch (e.inputType) {
        case "insertText":
        case "insertReplacementText":
          e.preventDefault();
          if (e.data) emitText(e.data);
          return;
        case "insertLineBreak":
        case "insertParagraph":
          e.preventDefault();
          return;
        case "deleteContentBackward":
          e.preventDefault();
          handlersRef.current.onBackspace();
          return;
        case "deleteWordBackward":
        case "deleteSoftLineBackward":
        case "deleteHardLineBackward":
          e.preventDefault();
          handlersRef.current.onDeleteWord();
          return;
        default:
          // Composition (IME, some mobile keyboards) can't be cancelled;
          // its text is picked up on compositionend instead.
          return;
      }
    }

    function handleCompositionStart() {
      isComposing = true;
    }

    function handleCompositionEnd(e: CompositionEvent) {
      isComposing = false;
      if (e.data) emitText(e.data);
      resetValue();
    }

    // Anything that slipped past beforeinput is discarded so the
    // textarea never holds text of its own.
    function handleInput() {
      if (!isComposing && input!.value !== SENTINEL) resetValue();
    }

    input.addEventListener("beforeinput", handleBeforeInput);
    input.addEventListener("compositionstart", handleCompositionStart);
    input.addEventListener("compositionend", handleCompositionEnd);
    input.addEventListener("input", handleInput);
    input.addEventListener("focus", resetValue);
    return () => {
      input.removeEventListener("focus", resetValue);
      input.removeEventListener("beforeinput", handleBeforeInput);
      input.removeEventListener("compositionstart", handleCompositionStart);
      input.removeEventListener("compositionend", handleCompositionEnd);
      input.removeEventListener("input", handleInput);
    };
  }, [inputRef]);
}
