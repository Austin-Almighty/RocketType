import type { TrackRecord } from "../gameContext";

// Same formulas the app has always stored, so new results stay
// comparable with existing leaderboard entries.
export function computeWpm(keyCount: number, mistakes: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return Math.max(0, Math.floor((keyCount - mistakes) / 5 / (seconds / 60)));
}

export function computeRaw(keystrokes: number, seconds: number): number {
  if (seconds <= 0 || keystrokes <= 0) return 0;
  return Math.floor((keystrokes / 5) * (60 / seconds));
}

export function buildRecord(
  keyCount: number,
  mistakes: number,
  elapsedSeconds: number,
  previous: TrackRecord | undefined
): TrackRecord {
  const prevKeys = previous?.keyCount ?? 0;
  const prevSeconds = previous?.elapsedSeconds ?? 0;
  return {
    keyCount,
    mistakes,
    elapsedSeconds,
    wpm: computeWpm(keyCount, mistakes, elapsedSeconds),
    raw: computeRaw(keyCount - prevKeys, elapsedSeconds - prevSeconds),
  };
}
