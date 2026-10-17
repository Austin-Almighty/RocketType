// Pure typing-test state shared by Rocket Run and Star Count.
// Every keystroke goes through typingReducer so keyCount and mistakes
// are always counted in one place.

export const MAX_EXTRA_CHARS = 10;

export type TypingState = {
  words: string[];
  typed: string[]; // typed[i] is what the user entered for words[i]
  wordIndex: number;
  keyCount: number; // character + space keystrokes; backspace is not counted
  mistakes: number; // wrong keystrokes, kept even after they are corrected
  started: boolean;
  finished: boolean;
};

export type TypingAction =
  | { type: "char"; char: string }
  | { type: "space" }
  | { type: "backspace" }
  | { type: "deleteWord" }
  | { type: "appendWords"; words: string[] };

export function createTypingState(words: string[]): TypingState {
  return {
    words,
    typed: [""],
    wordIndex: 0,
    keyCount: 0,
    mistakes: 0,
    started: false,
    finished: false,
  };
}

function withCurrentTyped(state: TypingState, value: string): string[] {
  const typed = [...state.typed];
  typed[state.wordIndex] = value;
  return typed;
}

function isLastWord(state: TypingState): boolean {
  return state.wordIndex === state.words.length - 1;
}

// Like Monkeytype, Backspace at the start of a word may step back into the
// previous word, but only if that word has a mistake. Correct words stay locked.
function backToPreviousWord(state: TypingState, clear: boolean): TypingState {
  const previous = state.wordIndex - 1;
  if (previous < 0 || state.typed[previous] === state.words[previous]) return state;
  const typed = state.typed.slice(0, state.wordIndex);
  if (clear) typed[previous] = "";
  return { ...state, typed, wordIndex: previous };
}

export function typingReducer(state: TypingState, action: TypingAction): TypingState {
  if (action.type === "appendWords") {
    return { ...state, words: [...state.words, ...action.words] };
  }
  if (state.finished) return state;

  const target = state.words[state.wordIndex] ?? "";
  const current = state.typed[state.wordIndex] ?? "";

  switch (action.type) {
    case "char": {
      if (current.length >= target.length + MAX_EXTRA_CHARS) return state;
      const expected = target[current.length];
      const isMistake = expected === undefined || action.char !== expected;
      const nextTyped = current + action.char;
      return {
        ...state,
        typed: withCurrentTyped(state, nextTyped),
        keyCount: state.keyCount + 1,
        mistakes: state.mistakes + (isMistake ? 1 : 0),
        started: true,
        // The last word ends the test as soon as it is typed correctly.
        finished: isLastWord(state) && nextTyped === target,
      };
    }
    case "space": {
      if (current.length === 0) return state;
      const skippedLetters = current.length < target.length;
      const base = {
        ...state,
        keyCount: state.keyCount + 1,
        mistakes: state.mistakes + (skippedLetters ? 1 : 0),
        started: true,
      };
      if (isLastWord(state)) return { ...base, finished: true };
      return {
        ...base,
        typed: [...state.typed, ""],
        wordIndex: state.wordIndex + 1,
      };
    }
    case "backspace": {
      if (current.length === 0) return backToPreviousWord(state, false);
      return { ...state, typed: withCurrentTyped(state, current.slice(0, -1)) };
    }
    case "deleteWord": {
      if (current.length === 0) return backToPreviousWord(state, true);
      return { ...state, typed: withCurrentTyped(state, "") };
    }
  }
}

// Number of words fully passed (space pressed, or the final word completed).
export function completedWords(state: TypingState): number {
  return state.finished ? state.wordIndex + 1 : state.wordIndex;
}

export function wordHasError(state: TypingState, index: number): boolean {
  return index < state.wordIndex && state.typed[index] !== state.words[index];
}
