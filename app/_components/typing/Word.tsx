import { memo } from "react";

type WordProps = {
  target: string;
  typed: string;
  index: number;
  isActive: boolean;
  hasError: boolean;
};

// Memoised so a keystroke only re-renders the word being typed.
function Word({ target, typed, index, isActive, hasError }: WordProps) {
  const extra = typed.slice(target.length);
  return (
    <span
      data-word={index}
      className={`typing-word ${hasError ? "typing-word-error" : ""}`}
    >
      {target.split("").map((char, i) => {
        let state = "typing-letter-pending";
        if (i < typed.length) {
          state = typed[i] === char ? "typing-letter-correct" : "typing-letter-incorrect";
        } else if (!isActive && typed.length > 0) {
          // A skipped word leaves its untyped letters marked as missed.
          state = "typing-letter-missed";
        }
        return (
          <span key={i} className={`typing-letter ${state}`}>
            {char}
          </span>
        );
      })}
      {extra.split("").map((char, i) => (
        <span key={`x${i}`} className="typing-letter typing-letter-extra">
          {char}
        </span>
      ))}
    </span>
  );
}

export default memo(Word);
