import type { TrackRecord } from "../gameContext";
import { correctCharacters, type TypingState } from "./engine";

export const SCORING_VERSION = 2;

export function elapsedTestSeconds(startedAt: number, now: number, limit: number | null): number {
  return Math.min(Math.max(0, (now - startedAt) / 1000), limit ?? Infinity);
}

export function computeWpm(correct: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return Math.max(0, Math.floor(correct / 5 / (seconds / 60)));
}

export function computeRaw(keystrokes: number, seconds: number): number {
  if (seconds <= 0 || keystrokes <= 0) return 0;
  return Math.floor((keystrokes / 5) * (60 / seconds));
}

// How steady the raw speed was from second to second, as a percentage:
// 100 means every second was equally fast. Uses Monkeytype's formula,
// which turns the coefficient of variation into a 0-100 score.
export function computeConsistency(records: TrackRecord[]): number {
  const raws = records.map((record) => record.raw);
  if (raws.length < 2) return 100;
  const mean = raws.reduce((sum, raw) => sum + raw, 0) / raws.length;
  if (mean === 0) return 0;
  const variance = raws.reduce((sum, raw) => sum + (raw - mean) ** 2, 0) / raws.length;
  const cov = Math.sqrt(variance) / mean;
  const score = 100 * (1 - Math.tanh(cov + cov ** 3 / 3 + cov ** 5 / 5));
  return Math.round(score);
}

// Wrong keystrokes made during each second (records hold running totals).
export function errorsPerSecond(records: TrackRecord[]): number[] {
  return records.map((record, i) => record.mistakes - (records[i - 1]?.mistakes ?? 0));
}

export function buildRecord(
  state: TypingState,
  elapsedSeconds: number,
  previous: TrackRecord | undefined
): TrackRecord {
  const { keyCount, mistakes } = state;
  const prevKeys = previous?.keyCount ?? 0;
  const prevSeconds = previous?.elapsedSeconds ?? 0;
  return {
    keyCount,
    mistakes,
    elapsedSeconds,
    wpm: computeWpm(correctCharacters(state), elapsedSeconds),
    raw: computeRaw(keyCount - prevKeys, elapsedSeconds - prevSeconds),
  };
}
