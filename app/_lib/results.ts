import type { TestProof } from "./verifiedTests";
import type { Timestamp } from "firebase/firestore";
import type { GameMode } from "./gameContext";
import type { CharacterStats } from "./typing/engine";
import { SCORING_VERSION } from "./typing/stats";

export type ResultDoc = {
  id: string;
  wpm: number;
  raw: number;
  accuracy: number;
  time: number | null;
  count: number | null;
  words: string | null;
  keyCount: number;
  errors: number;
  gameMode: string;
  createdAt: Timestamp | null;
  userUID?: string;
  userDisplayName?: string | null;
  scoringVersion?: number;
  verified?: boolean;
  elapsedSeconds?: number;
  testKind?: "standard" | "practice";
  characters?: CharacterStats;
};

export type CompletedResult = Omit<ResultDoc, "createdAt"> & {
  userUID: string;
  completedAt: number;
  proof?: TestProof;
};

export function isCurrentStandard(result: ResultDoc): boolean {
  return result.scoringVersion === SCORING_VERSION && result.testKind === "standard" &&
    Number.isFinite(result.wpm) && result.wpm >= 0 &&
    Number.isFinite(result.raw) && result.raw >= 0 &&
    Number.isFinite(result.accuracy) && result.accuracy >= 0 && result.accuracy <= 100 &&
    Number.isFinite(result.elapsedSeconds) && result.elapsedSeconds! > 0;
}

export function matchingResults(results: ResultDoc[], settings: GameMode): ResultDoc[] {
  return results.filter((result) => isCurrentStandard(result) &&
    result.gameMode === settings.mode && result.words === settings.words &&
    (settings.mode === "Rocket Run" ? result.time === settings.time : result.count === settings.count));
}

export function summarizeResults(results: ResultDoc[]) {
  if (!results.length) return null;
  const recent = results.slice(0, 10);
  return {
    best: Math.max(...results.map((result) => result.wpm)),
    recentAverage: Math.round(recent.reduce((sum, result) => sum + result.wpm, 0) / recent.length),
    accuracy: Math.round(recent.reduce((sum, result) => sum + result.accuracy, 0) / recent.length * 10) / 10,
    completed: results.length,
  };
}

export type LeaderboardRange = "All-time" | "Monthly" | "Daily";
export const LEADERBOARD_RANGES: readonly LeaderboardRange[] = ["All-time", "Monthly", "Daily"];

export function rankingPeriod(range: LeaderboardRange, now: Date): [number, number] {
  if (range === "All-time") return [-Infinity, Infinity];
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  return range === "Daily"
    ? [Date.UTC(year, month, day), Date.UTC(year, month, day + 1)]
    : [Date.UTC(year, month, 1), Date.UTC(year, month + 1, 1)];
}

export function rankResults(results: ResultDoc[], settings: GameMode, range: LeaderboardRange, now: Date): ResultDoc[] {
  const [start, end] = rankingPeriod(range, now);
  const sorted = matchingResults(results, settings)
    .filter((result) => result.userUID && result.createdAt &&
      result.createdAt.toMillis() >= start && result.createdAt.toMillis() < end)
    .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy ||
      a.createdAt!.toMillis() - b.createdAt!.toMillis() || a.id.localeCompare(b.id));
  const seen = new Set<string>();
  return sorted.filter((result) => {
    if (seen.has(result.userUID!)) return false;
    seen.add(result.userUID!);
    return true;
  });
}
