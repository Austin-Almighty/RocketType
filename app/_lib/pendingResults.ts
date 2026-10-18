import type { CompletedResult } from "./results";
import { SCORING_VERSION } from "./typing/stats";

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type PendingResults = { version: 1; generation: string; results: CompletedResult[] };
const keyFor = (uid: string) => "rockettype:pending-results:v1:" + uid;

function validProof(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const proof = value as Record<string, unknown>;
  return typeof proof.sessionID === "string" && /^[a-zA-Z0-9-]{1,100}$/.test(proof.sessionID) &&
    Array.isArray(proof.events) && proof.events.length > 0 && proof.events.length <= 20000 &&
    proof.events.every((event) => event && typeof event === "object" &&
      Number.isFinite(event.ms) && event.ms >= 0 && ["char", "space", "backspace", "deleteWord"].includes(event.type) &&
      (event.type !== "char" || typeof event.char === "string" && [...event.char].length === 1) &&
      Object.keys(event).every((key) => ["type", "ms", ...(event.type === "char" ? ["char"] : [])].includes(key)));
}

function isPendingResult(value: unknown, uid: string): value is CompletedResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  const nonNegative = (key: string) => typeof result[key] === "number" && Number.isFinite(result[key]) && result[key] >= 0;
  const characters = result.characters as Record<string, unknown> | undefined;
  return typeof result.id === "string" && /^[a-zA-Z0-9-]{1,100}$/.test(result.id) &&
    (result.proof === undefined || validProof(result.proof)) &&
    result.userUID === uid && (result.userDisplayName === null || typeof result.userDisplayName === "string") &&
    ["Rocket Run", "Star Count", "Zen"].includes(result.gameMode as string) &&
    [15, 30, 60, null].includes(result.time as number | null) &&
    [20, 50, 100, null].includes(result.count as number | null) &&
    ["1k", "5k", null].includes(result.words as string | null) &&
    ["standard", "practice"].includes(result.testKind as string) && result.scoringVersion === SCORING_VERSION &&
    ["wpm", "raw", "accuracy", "keyCount", "errors", "elapsedSeconds", "completedAt"].every(nonNegative) &&
    (result.accuracy as number) <= 100 && (result.errors as number) <= (result.keyCount as number) &&
    (result.elapsedSeconds as number) > 0 && Boolean(characters) &&
    ["correct", "incorrect", "extra", "missed"].every((key) =>
      typeof characters?.[key] === "number" && Number.isSafeInteger(characters[key]) && (characters[key] as number) >= 0);
}

export function readPendingResults(storage: StorageLike, uid: string): PendingResults {
  const raw = storage.getItem(keyFor(uid));
  if (!raw) return { version: 1, generation: "initial", results: [] };
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 1 ||
      !("generation" in parsed) || typeof parsed.generation !== "string" ||
      !("results" in parsed) || !Array.isArray(parsed.results)) {
    throw new Error("Saved recovery data has an unsupported format.");
  }
  const results = parsed.results.filter((result) => isPendingResult(result, uid));
  if (results.length !== parsed.results.length) console.error("Ignored invalid saved recovery entries");
  return { version: 1, generation: parsed.generation, results: results.map((result) => ({
    ...(result.proof ? { proof: result.proof } : {}),
    ...(result.verified !== undefined ? { verified: result.verified === true } : {}),
    id: result.id, userUID: result.userUID, userDisplayName: result.userDisplayName,
    completedAt: result.completedAt, gameMode: result.gameMode, time: result.time,
    count: result.count, words: result.words, testKind: result.testKind,
    scoringVersion: result.scoringVersion, elapsedSeconds: result.elapsedSeconds,
    wpm: result.wpm, raw: result.raw, accuracy: result.accuracy,
    keyCount: result.keyCount, errors: result.errors,
    characters: { correct: result.characters!.correct, incorrect: result.characters!.incorrect,
      extra: result.characters!.extra, missed: result.characters!.missed },
  })) };
}

async function storageLock<T>(uid: string, action: () => Promise<T>): Promise<T> {
  const locks = window.navigator?.locks;
  return locks ? locks.request(keyFor(uid), action) : action();
}

// Saves share this lock; reset holds it exclusively until deletion finishes.
export async function withResultLock<T>(uid: string, mode: "shared" | "exclusive", action: () => Promise<T>): Promise<T> {
  const locks = window.navigator?.locks;
  if (!locks && mode === "exclusive") throw new Error("Data reset isn’t supported in this browser. Try a current browser.");
  return locks ? locks.request(keyFor(uid) + ":writes", { mode }, action) : action();
}

export async function storePendingResult(storage: StorageLike, result: CompletedResult): Promise<boolean> {
  const generation = readPendingResults(storage, result.userUID).generation;
  return storageLock(result.userUID, async () => {
    const current = readPendingResults(storage, result.userUID);
    if (current.generation !== generation) return false;
    current.results = [...current.results.filter((entry) => entry.id !== result.id), result];
    storage.setItem(keyFor(result.userUID), JSON.stringify(current));
    return true;
  });
}

export async function removePendingResult(storage: StorageLike, uid: string, id: string) {
  await storageLock(uid, async () => {
    const current = readPendingResults(storage, uid);
    current.results = current.results.filter((result) => result.id !== id);
    storage.setItem(keyFor(uid), JSON.stringify(current));
  });
}

export async function clearPendingResults(storage: StorageLike, uid: string) {
  await storageLock(uid, async () => {
    // Keep a generation marker so pre-reset requests queued in another tab cannot re-enqueue old results.
    storage.setItem(keyFor(uid), JSON.stringify({ version: 1, generation: crypto.randomUUID(), results: [] }));
  });
}
