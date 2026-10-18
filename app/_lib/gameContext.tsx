"use client"
import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { useUser } from "./userContext";
import resultToDB from "./resultToFirebase";
import type { CompletedResult } from "./results";
import { readPendingResults, storePendingResult, removePendingResult, clearPendingResults, withResultLock } from "./pendingResults";
import type { CharacterStats } from "./typing/engine";

export type GameMode = {
    start: boolean,
    mode: "Rocket Run" | "Star Count" | "Zen" | null,
    time: number | null, // Only used for 'time' mode
    count: number | null, // Only used for 'count' mode
    words: "1k" | "5k" | null
};

export type TrackRecord = {
  keyCount: number;
  wpm: number;
  raw: number;
  mistakes: number;
  elapsedSeconds: number;
};

// Extra details about the last test, shown on the result page.
export type TestDetails = {
  characters: CharacterStats;
  settings: GameMode;
  resultID: string;
  testKind: "standard" | "practice";
  missedWords: string[];
  completedAt: number;
  // null when the player isn't logged in or the lookup failed
  personalBest: { previous: number | null; isNew: boolean } | null;
};

export const MODE_OPTIONS = ["Rocket Run", "Star Count", "Zen"] as const;
export const TIME_OPTIONS = [15, 30, 60] as const;
export const COUNT_OPTIONS = [20, 50, 100] as const;
export const WORD_OPTIONS = ["1k", "5k"] as const;

const SETTINGS_KEY = "settings";

type SavedSettings = Pick<GameMode, "mode" | "time" | "count" | "words">;

const DEFAULT_SETTINGS = {
    mode: "Rocket Run",
    time: 30,
    count: 50,
    words: "1k",
} as const;

export function settingsReady(gameMode: GameMode): boolean {
  if (gameMode.mode === "Rocket Run") return Boolean(gameMode.time && gameMode.words);
  if (gameMode.mode === "Star Count") return Boolean(gameMode.count && gameMode.words);
  return gameMode.mode === "Zen";
}

// localStorage can hold anything, so keep only values the settings bar offers.
function pickOption<T>(options: readonly T[], value: unknown, fallback: T): T {
    return options.includes(value as T) ? (value as T) : fallback;
}

function parseSavedSettings(raw: string): SavedSettings {
    const saved: Record<string, unknown> = JSON.parse(raw) ?? {};
    return {
        mode: pickOption(MODE_OPTIONS, saved.mode, DEFAULT_SETTINGS.mode),
        time: pickOption(TIME_OPTIONS, saved.time, DEFAULT_SETTINGS.time),
        count: pickOption(COUNT_OPTIONS, saved.count, DEFAULT_SETTINGS.count),
        words: pickOption(WORD_OPTIONS, saved.words, DEFAULT_SETTINGS.words),
    };
}

type SaveEntry = { result: CompletedResult; status: "saving" | "saved" | "error"; message?: string; volatile?: boolean; generation?: string };

type GameContextType = {
    practiceWords: string[] | null;
    setPracticeWords: React.Dispatch<React.SetStateAction<string[] | null>>;
    savedResults: SaveEntry[];
    saveResult: (result: CompletedResult) => Promise<void>;
    retryResult: (id: string) => Promise<void>;
    resetResults: (action: () => Promise<void>) => Promise<void>;
    resettingResults: boolean;
    gameMode: GameMode;
    setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
    settingsLoaded: boolean;
    trackBySecond: TrackRecord[];
    setTrackBySecond: React.Dispatch<React.SetStateAction<TrackRecord[]>>;
    testDetails: TestDetails | null;
    setTestDetails: React.Dispatch<React.SetStateAction<TestDetails | null>>;
    resetGame: ()=>void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [gameMode, setGameMode] = useState<GameMode>({
        start: false,
        ...DEFAULT_SETTINGS,
    });
    // False until the saved settings are read, so the settings bar doesn't
    // animate from the defaults to the saved values on page load.
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    const [trackBySecond, setTrackBySecond] = useState<TrackRecord[]>([]);
    const [testDetails, setTestDetails] = useState<TestDetails | null>(null);

    const [practiceWords, setPracticeWords] = useState<string[] | null>(null);
    const [savedResults, setSavedResults] = useState<SaveEntry[]>([]);
    const inFlight = useRef(new Map<string, { uid: string; promise: Promise<void> }>());
    const blockedUsers = useRef(new Set<string>());
    const entriesRef = useRef<SaveEntry[]>([]);
    const [resettingResults, setResettingResults] = useState(false);
    const [recoveryError, setRecoveryError] = useState(false);
    const { user } = useUser();

    const updateEntries = useCallback((update: (entries: SaveEntry[]) => SaveEntry[]) => {
        entriesRef.current = update(entriesRef.current);
        setSavedResults(entriesRef.current);
    }, []);

    useEffect(() => {
        if (!user) return;
        function restore() {
            try {
                const pending = readPendingResults(localStorage, user!.uid);
                updateEntries((entries) => [
                    ...entries.filter((entry) => entry.result.userUID !== user!.uid ||
                        (entry.volatile && entry.generation === pending.generation) ||
                        (entry.status === "saved" && !pending.results.some((result) => result.id === entry.result.id)) || inFlight.current.has(entry.result.id)),
                    ...pending.results.filter((result) => !inFlight.current.has(result.id)).map((result) => ({ result, status: "error" as const, generation: pending.generation })),
                ]);
                setRecoveryError(false);
            } catch (error) {
                console.error("Could not restore pending results", error);
                setRecoveryError(true);
            }
        }
        restore();
        window.addEventListener("storage", restore);
        return () => window.removeEventListener("storage", restore);
    }, [user, updateEntries]);

    const attemptSave = useCallback((result: CompletedResult, retry: boolean): Promise<void> => {
        const active = inFlight.current.get(result.id);
        if (active) return active.promise;
        if (blockedUsers.current.has(result.userUID)) return Promise.resolve();
        const previous = entriesRef.current.find((entry) => entry.result.id === result.id);
        if (retry && !previous) return Promise.resolve();
        updateEntries((entries) => [
            ...entries.filter((entry) => entry.result.id !== result.id && entry.status !== "saved"),
            { result, status: "saving" },
        ]);
        async function run() {
            let persistent = false;
            let generation = previous?.generation;
            try {
                try {
                    if (!retry) {
                        generation = readPendingResults(localStorage, result.userUID).generation;
                        const stored = await storePendingResult(localStorage, result);
                        if (!stored) {
                            updateEntries((entries) => entries.filter((entry) => entry.result.id !== result.id));
                            return;
                        }
                    }
                    persistent = readPendingResults(localStorage, result.userUID).results.some((entry) => entry.id === result.id);
                } catch (error) {
                    console.error("Could not keep result in browser storage", error);
                }
                await withResultLock(result.userUID, "shared", async () => {
                    let current;
                    try { current = readPendingResults(localStorage, result.userUID); }
                    catch (error) { console.error("Could not check saved recovery data", error); }
                    if (current && ((generation !== undefined && current.generation !== generation) ||
                        ((persistent || (retry && !previous?.volatile)) && !current.results.some((entry) => entry.id === result.id)))) {
                        updateEntries((entries) => entries.filter((entry) => entry.result.id !== result.id));
                        return;
                    }
                    const saved = await resultToDB(result);
                    if (persistent) {
                        try { await removePendingResult(localStorage, result.userUID, result.id); }
                        catch (error) { console.error("Could not clear saved recovery entry", error); }
                    }
                    updateEntries((entries) => entries.map((entry) => entry.result.id === result.id ? { ...entry, result: saved ?? entry.result, status: "saved" } : entry));
                });
            } catch (error) {
                console.error("Failed to save result", error);
                updateEntries((entries) => entries.map((entry) => entry.result.id === result.id
                    ? { ...entry, status: "error", volatile: !persistent, generation, message: persistent ? undefined : "Browser storage is unavailable. Keep this tab open and retry." } : entry));
            } finally {
                inFlight.current.delete(result.id);
            }
        }
        const promise = run();
        inFlight.current.set(result.id, { uid: result.userUID, promise });
        return promise;
    }, [updateEntries]);

    const saveResult = useCallback((result: CompletedResult) => attemptSave(result, false), [attemptSave]);
    const retryResult = useCallback(async (id: string) => {
        const entry = entriesRef.current.find((entry) => entry.result.id === id);
        if (entry) await attemptSave(entry.result, true);
    }, [attemptSave]);

    const resetResults = useCallback(async (action: () => Promise<void>) => {
        if (!user) throw new Error("Sign in before changing your account data.");
        const uid = user.uid;
        if (blockedUsers.current.has(uid)) throw new Error("An account change is already in progress.");
        blockedUsers.current.add(uid);
        setResettingResults(true);
        try {
            await Promise.all([...inFlight.current.values()].filter((entry) => entry.uid === uid).map((entry) => entry.promise));
            await withResultLock(uid, "exclusive", async () => {
                const pending = readPendingResults(localStorage, uid).results;
                await clearPendingResults(localStorage, uid);
                try {
                    await action();
                } catch (error) {
                    // Failed account changes must leave unsaved tests available for recovery.
                    for (const result of pending) await storePendingResult(localStorage, result);
                    const generation = readPendingResults(localStorage, uid).generation;
                    updateEntries((entries) => entries.map((entry) => entry.result.userUID === uid ? { ...entry, generation } : entry));
                    throw error;
                }
                updateEntries((entries) => entries.filter((entry) => entry.result.userUID !== uid));
                setTrackBySecond([]);
                setTestDetails(null);
                setPracticeWords(null);
            });
        } finally {
            blockedUsers.current.delete(uid);
            setResettingResults(false);
        }
    }, [user, updateEntries]);

    // On mount, restore the last settings from localStorage if present
    useEffect(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                const saved = parseSavedSettings(raw);
                setGameMode((prev) => ({ ...prev, ...saved }));
            }
        } catch (e) {
            console.error(e);
        }
        setSettingsLoaded(true);
    }, []);

    // Remember the settings whenever they change
    useEffect(() => {
        if (!settingsLoaded) return;
        try {
            const { mode, time, count, words } = gameMode;
            localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode, time, count, words }));
        } catch (e) {
            console.error(e);
        }
    }, [settingsLoaded, gameMode]);

    function resetGame() {
        setTrackBySecond([]);
    }
    return (
        <GameContext.Provider value={{ retryResult, resetResults, resettingResults, practiceWords, setPracticeWords, savedResults, saveResult, gameMode, setGameMode, settingsLoaded, trackBySecond, setTrackBySecond, testDetails, setTestDetails, resetGame }}>
            {children}
            {recoveryError && <p role="status" className="p-3 text-center text-base-content">Couldn’t read saved recovery data. Keep this tab open if a result fails to save.</p>}
            {savedResults.filter((entry) => entry.status === "error" && entry.result.userUID === user?.uid).map((entry) => (
              <aside key={entry.result.id} role="status" className="bg-base-200 text-base-content border-t border-warning p-3 text-center">
                <span>A result from {new Date(entry.result.completedAt).toLocaleTimeString()} couldn’t be saved. </span>
                {entry.message && <span>{entry.message} </span>}
                <button type="button" className="btn btn-sm btn-warning" disabled={resettingResults} onClick={() => void retryResult(entry.result.id)}>Retry saving</button>
              </aside>
            ))}
        </GameContext.Provider>
    );
}

export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGameContext must be used within a GameProvider");
    }
    return context;
}



export { GameContext };
