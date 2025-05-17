'use client';
import { useEffect, useState, useRef } from 'react';

export default function WpmCounter() {
    const [keyCount, setKeyCount] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Start timer on mount, and clear on unmount
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Only update keyCount on keydown
    useEffect(() => {
        function totalKeyPress(e: KeyboardEvent) {
            if (e.key.length === 1) {
                setKeyCount(prev => prev + 1);
            }
        }
        document.addEventListener('keydown', totalKeyPress);
        return () => {
            document.removeEventListener('keydown', totalKeyPress);
        };
    }, []);

    // Calculate WPM (words = keyCount/5, per minute)
    const minutes = elapsedSeconds / 60;
    let wpm = 0;
    if (minutes > 0) {
        wpm = Math.floor((keyCount / 5) / minutes);
    }

    return (
        <div className="stats text-blue-950 flex items-center text-center">
            <div className="stat">
                <div className="stat-title text-blue-950">WPM</div>
                <div className="stat-value">{wpm}</div>
                <div className="stat-desc text-xs text-blue-950">
                    {keyCount} keystrokes, {elapsedSeconds}s elapsed
                </div>
            </div>
        </div>
    );
}