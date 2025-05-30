'use client';
import { useEffect } from 'react';

type WpmProps = {
    mistakes: number,
    keyCount: number,
    elapsedSeconds: number,
    setWpm: React.Dispatch<React.SetStateAction<number>>,
    setRaw: React.Dispatch<React.SetStateAction<number>>,
    instantRaw: number | null
}

export default function WpmCounter({mistakes, keyCount, elapsedSeconds, setWpm, setRaw, instantRaw}: WpmProps) {
    // Calculate RAW WPM (words = keyCount/5, per minute)
    const minutes = elapsedSeconds / 60;
    let raw = 0;
    let wpm = 0;
    if (minutes > 0) {
        raw = Math.floor((keyCount / 5) / minutes);
        wpm = Math.floor((keyCount - mistakes) / 5 / minutes);
    }

    useEffect(() => {
        setRaw(raw);
        setWpm(wpm);
    }, [raw, wpm, setRaw, setWpm]);

    return (
        <div className="stats text-blue-950 flex items-center text-center">
            <div className="stat">
                <div className="stat-title text-blue-950">WPM</div>
                <div className="stat-value">{wpm}</div>
                <div className="stat-desc text-xs text-blue-950">
                    {keyCount} keystrokes, {elapsedSeconds}s elapsed, {mistakes} errors, avg raw WPM: {raw}, instant raw WPM (last second): {instantRaw}
                </div>
            </div>
        </div>
    );
}