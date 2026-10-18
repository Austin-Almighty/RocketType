import { useEffect } from "react";
import { settingsReady, useGameContext } from "../_lib/gameContext";
import { isInteractiveTarget } from "../_lib/keyboard";
import SpaceShuttle from "@/components/svgs/SpaceShuttle";

export default function StartScreen({ onStart }: { onStart: () => void }) {
  const { gameMode, settingsLoaded, resettingResults } = useGameContext();
  const ready = settingsLoaded && !resettingResults && settingsReady(gameMode);

  useEffect(() => {
    if (!ready) return;
    function start(e: KeyboardEvent) {
      if (e.key !== " " || e.repeat || e.metaKey || e.ctrlKey || e.altKey ||
        isInteractiveTarget(e.target) || document.querySelector("dialog[open]")) return;
      e.preventDefault();
      onStart();
    }
    document.addEventListener("keydown", start);
    return () => document.removeEventListener("keydown", start);
  }, [ready, onStart]);

  return (
    <section className="flex flex-col items-center gap-5 py-8 sm:py-10 text-base-content text-center">
      <div className="h-48 w-48 flex items-center justify-center" aria-hidden="true">
        <div className="rotate-270 scale-75">
          <SpaceShuttle flying={ready} thrust={ready} />
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl">Ready for launch?</h1>
      <p className="text-base-content/90 max-w-sm px-4">Choose your settings, then start. {gameMode.mode === "Zen" ? "Enjoy a quiet space to write." : "The clock begins with your first letter."}</p>
      <button type="button" className="btn btn-primary btn-lg rounded-2xl" disabled={!ready} onClick={onStart}>
        {resettingResults ? "Updating account data…" : ready ? "Start typing" : "Loading settings…"}
      </button>
      <p className="text-sm text-base-content/90 hidden sm:block">or press Space</p>
    </section>
  );
}
