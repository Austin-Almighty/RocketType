import { useEffect } from "react";
import TypingTest from "./typing/TypingTest";
import ZenMode from "./ZenMode";
import KeyHints from "./KeyHints";
import { useGameContext } from "../_lib/gameContext";
import { GrPowerReset } from "react-icons/gr";
import { IoMdReturnLeft } from "react-icons/io";

export default function App({ reStart, goHome }: { reStart: () => void, goHome: () => void }) {
  const { gameMode } = useGameContext();

  // Tab restarts the test, like Monkeytype, and Esc goes back to the settings.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        e.preventDefault();
        reStart();
      } else if (e.key === "Escape") {
        e.preventDefault();
        goHome();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [reStart, goHome]);

  return (
    <div className="w-[85%] sm:w-3/4 mx-auto absolute top-[25vh] text-primary-content animate-[test-in_300ms_ease-out]">
      {gameMode.mode === "Zen" ? <ZenMode /> : <TypingTest />}

      <div className="flex justify-center gap-20 mt-10 text-base-content relative z-10">
        <div className="tooltip tooltip-bottom" data-tip="Restart (Tab)">
          <button type="button" aria-label="Restart test" onClick={reStart} className="btn btn-ghost btn-circle">
            <GrPowerReset className="sm:w-8 sm:h-8 h-6 w-6 fill-base-content text-base-content" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Back (Esc)">
          <button type="button" aria-label="Back to settings" onClick={goHome} className="btn btn-ghost btn-circle">
            <IoMdReturnLeft className="sm:w-8 sm:h-8 w-6 h-6 fill-base-content" />
          </button>
        </div>
      </div>
      <div className="mt-6 relative z-10">
        <KeyHints hints={[{ keys: ["tab"], action: "restart" }, { keys: ["esc"], action: "settings" }]} />
      </div>
    </div>
  );
}
