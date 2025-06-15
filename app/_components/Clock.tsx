"use client";
import { useEffect, useState } from "react";

type ClockProps = {
  start: number|undefined;
};

export function Clock({ start }: ClockProps) {
  const [counter, setCounter] = useState(start);

  useEffect(() => {
    if (counter === undefined) return;
    if (counter <= 0) return;
    const timer = setInterval(() => {
      setCounter((prev) => (prev === undefined ? 0: prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [counter]);

  return (
    <span className="countdown font-mono text-4xl text-base-content">
      <span
        style={{ "--value": counter } as React.CSSProperties}
        aria-live="polite"
        // aria-label={counter.toString()}
      >
        {counter}
      </span>
    </span>
  );
}
