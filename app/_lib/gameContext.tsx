"use client"
import { createContext, useContext, useState, ReactNode } from "react";

type GameMode = {
    start: boolean,
    time: number|undefined,
    mode: "Strict" | "Time Attack" | "Zen" | undefined,
    words: "1k" | "5k" | "10k" | undefined
};

type TrackRecord = {
  keyCount: number;
  wpm: number;
  raw: number;
  mistakes: number;
  elapsedSeconds: number;
};

type GameContextType = {
    gameMode: GameMode;
    setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
    trackBySecond: TrackRecord[];
    setTrackBySecond: React.Dispatch<React.SetStateAction<TrackRecord[]>>;
    resetGame: ()=>void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [gameMode, setGameMode] = useState<GameMode>({
        start: false,
        time: undefined,
        mode: undefined,
        words: undefined,
    });

    const [trackBySecond, setTrackBySecond] = useState<TrackRecord[]>([]);

    function resetGame() {
        setTrackBySecond([]);
    }
    return (
        <GameContext.Provider value={{ gameMode, setGameMode, trackBySecond, setTrackBySecond, resetGame }}>
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