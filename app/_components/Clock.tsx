"use client";
import { useEffect, useState } from "react";

type ClockProps = {
  start: number|null;
  running: boolean;
};

export function Clock({ start, running }: ClockProps) {

  const [counter, setCounter] = useState(start);

  useEffect(() => {
    setCounter(start);
  }, [start]);

  useEffect(() => {
    if (!running) return;
    if (counter === null) return;
    if (counter <= 0) return;
    const timer = setInterval(() => {
      setCounter((prev) => (prev === null ? 0: prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [running, counter]);

  return (
    <span className="countdown font-mono text-3xl sm:text-4xl text-base-content">
      <span
        style={{ "--value": counter } as React.CSSProperties}
        aria-live="polite"
        aria-label={counter?.toString()}
      >
        {counter}
      </span>
    </span>
  );
}
