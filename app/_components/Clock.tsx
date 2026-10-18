"use client";

type ClockProps = { seconds: number | null };

export function Clock({ seconds }: ClockProps) {
  return <span className="font-mono tabular-nums" aria-label={(seconds ?? 0) + " seconds left"}>{seconds ?? 0}</span>;
}
