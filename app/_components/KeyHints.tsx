import { Fragment } from "react";

type KeyHint = { keys: string[]; action: string };

// Keyboard shortcut reminders, e.g. "tab or enter – restart".
// Hidden on small screens, which usually have no physical keyboard.
export default function KeyHints({ hints }: { hints: KeyHint[] }) {
  return (
    <p className="hidden md:flex justify-center gap-6 text-sm text-base-content/90">
      {hints.map((hint) => (
        <span key={hint.action} className="flex items-center gap-1.5">
          {hint.keys.map((key, i) => (
            <Fragment key={key}>
              {i > 0 && <span>or</span>}
              <kbd className="kbd kbd-sm">{key}</kbd>
            </Fragment>
          ))}
          <span>– {hint.action}</span>
        </span>
      ))}
    </p>
  );
}
