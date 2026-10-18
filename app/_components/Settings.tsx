import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import {
  COUNT_OPTIONS,
  GameMode,
  MODE_OPTIONS,
  TIME_OPTIONS,
  WORD_OPTIONS,
  useGameContext,
} from "../_lib/gameContext";
import OptionGroup from "./settings/OptionGroup";
import { FaKeyboard } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { MdTimer } from "react-icons/md";
import { TiSortAlphabetically } from "react-icons/ti";
import { IoDocument } from "react-icons/io5";

// Quick and settled: no visible bounce on the highlight or the bar width.
const SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

const FADE = {
  initial: { opacity: 0, filter: "blur(4px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
};

const MODE_DESCRIPTIONS: Record<(typeof MODE_OPTIONS)[number], string> = {
  "Rocket Run": "Race the clock: type as many words as you can before time runs out.",
  "Star Count": "Type a set number of words as fast as you can.",
  Zen: "No timer, no score. Just type and watch the stars drift by.",
};

// Tracks an element's width so the bar can animate to it instead of jumping.
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.offsetWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function summarize(gameMode: GameMode): string {
  const parts = [
    gameMode.mode,
    gameMode.mode === "Rocket Run" && `${gameMode.time}s`,
    gameMode.mode === "Star Count" && `${gameMode.count} words`,
    gameMode.mode !== "Zen" && gameMode.words,
  ];
  return parts.filter(Boolean).join(" · ");
}

export default function Settings() {
  const { settingsLoaded } = useGameContext();
  // Remount once the saved settings are read, so the bar appears with them
  // in place instead of sliding over from the defaults.
  return <SettingsPanel key={settingsLoaded ? "loaded" : "default"} visible={settingsLoaded} />;
}

function SettingsPanel({ visible }: { visible: boolean }) {
  const { gameMode, setGameMode } = useGameContext();
  const [contentRef, contentWidth] = useWidth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function update(change: Partial<GameMode>) {
    setGameMode((prev) => ({ ...prev, ...change }));
  }

  // Only the groups that apply to the current mode are shown.
  const groups: ({ key: string; label: string; render: (compact: boolean) => ReactNode } | false)[] = [
    {
      key: "mode",
      label: "Mode",
      render: (compact) => (
        <OptionGroup
          id="mode"
          label="Mode"
          compact={compact}
          icon={<FaKeyboard />}
          options={MODE_OPTIONS}
          format={(mode) => mode === "Rocket Run" ? "Timed · Rocket Run" : mode === "Star Count" ? "Words · Star Count" : "Zen"}
          value={gameMode.mode}
          onChange={(mode) => update({ mode })}
        />
      ),
    },
    gameMode.mode === "Rocket Run" && {
      key: "time",
      label: "Time in seconds",
      render: (compact) => (
        <OptionGroup
          id="time"
          label="Time in seconds"
          compact={compact}
          icon={<MdTimer />}
          options={TIME_OPTIONS}
          value={gameMode.time}
          onChange={(time) => update({ time })}
        />
      ),
    },
    gameMode.mode === "Star Count" && {
      key: "count",
      label: "Word count",
      render: (compact) => (
        <OptionGroup
          id="count"
          label="Word count"
          compact={compact}
          icon={<IoDocument />}
          options={COUNT_OPTIONS}
          value={gameMode.count}
          onChange={(count) => update({ count })}
        />
      ),
    },
    gameMode.mode !== "Zen" && {
      key: "words",
      label: "Word set",
      render: (compact) => (
        <OptionGroup
          id="words"
          label="Word set"
          compact={compact}
          icon={<TiSortAlphabetically />}
          options={WORD_OPTIONS}
          format={(words) => words === "1k" ? "1,000 common words" : "5,000 common words"}
          value={gameMode.words}
          onChange={(words) => update({ words })}
        />
      ),
    },
  ];
  const visibleGroups = groups.filter((group) => group !== false);

  return (
    <MotionConfig reducedMotion="user" transition={SPRING}>
      <div
        className={`flex flex-col justify-center items-center gap-3 z-1 ${
          visible ? "animate-[test-in_300ms_ease-out]" : "invisible"
        }`}
      >
        <LayoutGroup id="settings-bar">
          <motion.div
            className="hidden md:block max-w-full bg-base-300 rounded-2xl overflow-hidden"
            initial={false}
            animate={{ width: contentWidth ?? "auto" }}
          >
            <div ref={contentRef} className="relative flex flex-wrap justify-center items-center w-max max-w-[95vw] p-2 text-sm lg:text-base">
              <AnimatePresence initial={false} mode="popLayout">
                {visibleGroups.map((group, i) => (
                  <motion.div key={group.key} layout="position" className="flex items-center" {...FADE}>
                    {i > 0 && <span aria-hidden className="mx-2 h-6 w-px bg-base-content/15" />}
                    {group.render(false)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </LayoutGroup>

        {/* What the selected mode is, since the names alone don't say. */}
        <div className="hidden md:block h-5 text-sm text-base-content/90">
          <AnimatePresence initial={false} mode="wait">
            {gameMode.mode && (
              <motion.p
                key={gameMode.mode}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
              >
                {MODE_DESCRIPTIONS[gameMode.mode]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          className="md:hidden flex items-center gap-2 bg-base-300 rounded-2xl text-base-content px-4 py-3 z-1 cursor-pointer hover:bg-info hover:text-info-content "
          onClick={() => dialogRef.current?.showModal()}
        >
          <IoIosSettings className="w-6 h-6 shrink-0" />
          <span>{summarize(gameMode)}</span>
        </button>
        <dialog ref={dialogRef} className="modal md:hidden">
          <div className="modal-box w-11/12 max-w-sm flex flex-col">
            <h2 className="font-bold mb-4 text-base-content">Test Settings</h2>
            <LayoutGroup id="settings-modal">
              <AnimatePresence initial={false}>
                {visibleGroups.map((group) => (
                  <motion.div
                    key={group.key}
                    className="overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="mb-1 ml-2 text-xs text-base-content/90">{group.label}</p>
                    <div className="mb-3 bg-base-300 rounded-2xl p-1 text-sm">{group.render(true)}</div>
                    {group.key === "mode" && gameMode.mode && (
                      <p className="-mt-1 mb-3 mx-2 text-xs text-base-content/90">{MODE_DESCRIPTIONS[gameMode.mode]}</p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </LayoutGroup>
            <form method="dialog" className="mt-1">
              <button className="btn w-full rounded-2xl">Done</button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </MotionConfig>
  );
}
