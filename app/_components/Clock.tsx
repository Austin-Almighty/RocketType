"use client";

type ClockProps = {
  seconds: number | null;
};

// Display only: the running test owns the timer and passes the time left.
export function Clock({ seconds }: ClockProps) {
  return (
    <span className="countdown font-mono">
      <span
        style={{ "--value": seconds ?? 0 } as React.CSSProperties}
        aria-live="polite"
        aria-label={`${seconds ?? 0} seconds left`}
      >
        {seconds}
      </span>
    </span>
  );
}
