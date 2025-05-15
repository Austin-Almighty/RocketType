"use client";
import { useEffect, useState } from "react";

type ClockProps = {
  start: number;
};

export function Clock({ start }: ClockProps) {
  const [counter, setCounter] = useState(start);

  useEffect(() => {
    if (counter <= 0) return;
    const timer = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [counter]);

  return (
    <span className="countdown font-mono text-4xl text-blue-950">
      <span
        style={{ "--value": counter } as React.CSSProperties}
        aria-live="polite"
        aria-label={counter.toString()}
      >
        {counter}
      </span>
    </span>
  );
}
