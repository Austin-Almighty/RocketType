import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./Firebase";
import type { GameMode } from "./gameContext";
import type { TypingAction } from "./typing/engine";

export const verifiedBackendEnabled = process.env.NEXT_PUBLIC_VERIFIED_RESULTS === "true";
const functions = getFunctions(firebaseApp, "us-central1");
export type TestEvent = Exclude<TypingAction, { type: "appendWords" }> & { ms: number };
export type TestProof = { sessionID: string; events: TestEvent[] };
export type VerifiedTest = { id: string; targets: string[] };

export async function createVerifiedTest(id: string, settings: GameMode, practiceWords: string[] | null) {
  return (await httpsCallable<unknown, VerifiedTest>(functions, "createTest")({ id, settings, practiceWords })).data;
}
const starts = new Map<string, Promise<void>>();
export function beginVerifiedTest(id: string): Promise<void> {
  let active = starts.get(id);
  if (!active) {
    active = httpsCallable(functions, "beginTest")({ id }).then(() => {}).catch((error) => { starts.delete(id); throw error; });
    starts.set(id, active);
  }
  return active;
}
export async function callBackend<T>(name: string, data: unknown): Promise<T> {
  return (await httpsCallable<unknown, T>(functions, name)(data)).data;
}
export function forgetTestStart(id: string) { starts.delete(id); }
