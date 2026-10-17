"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

type GameContextType = {
    gameMode: GameMode;
    setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
    settingsLoaded: boolean;
    trackBySecond: TrackRecord[];
    setTrackBySecond: React.Dispatch<React.SetStateAction<TrackRecord[]>>;
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
        <GameContext.Provider value={{ gameMode, setGameMode, settingsLoaded, trackBySecond, setTrackBySecond, resetGame }}>
            {children}
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
