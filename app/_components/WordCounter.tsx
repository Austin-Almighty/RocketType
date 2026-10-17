"use client";

import { useGameContext } from "../_lib/gameContext";

export default function WordCounter({ complete }: { complete: number }) {
  const { gameMode } = useGameContext();
  const showTotal = gameMode.mode === "Star Count" && typeof gameMode.count === "number";
  return (
    <span className="font-mono" aria-live="polite">
      {complete}
      {showTotal && <span className="text-base-content/50">/{gameMode.count}</span>}
    </span>
  );
}
