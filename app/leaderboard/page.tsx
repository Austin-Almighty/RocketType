"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TIME_OPTIONS } from "../_lib/gameContext";
import { LEADERBOARD_RANGES, type LeaderboardRange } from "../_lib/results";
import LeaderboardFilter from "./_components/Filter";
import Leaderboard from "./_components/Leaderboard";

function Rankings() {
  const params = useSearchParams();
  const router = useRouter();
  const requestedRange = params.get("range") as LeaderboardRange;
  const range = LEADERBOARD_RANGES.includes(requestedRange) ? requestedRange : "All-time";
  const requestedTime = Number(params.get("time") ?? 30);
  const time = TIME_OPTIONS.includes(requestedTime as 15 | 30 | 60) ? requestedTime : 30;
  const words = params.get("words") === "5k" ? "5k" : "1k";
  function change(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.replace("/leaderboard?" + next.toString(), { scroll: false });
  }
  return (
    <div className="w-[92%] max-w-6xl mx-auto my-6 space-y-5 text-base-content">
      <h1 className="text-3xl">Leaderboard</h1>
      <p className="text-base-content/90">Your best standard timed test for each set of settings. Daily and monthly periods use UTC.</p>
      <LeaderboardFilter range={range} time={time} words={words} onChange={change} />
      <Leaderboard key={range + time + words} range={range} time={time} words={words} />
    </div>
  );
}

export default function LeaderboardPage() {
  return <Suspense fallback={<p className="p-10 text-center">Loading leaderboard…</p>}>
    <Rankings />
  </Suspense>;
}
