"use client";
import { TIME_OPTIONS } from "@/app/_lib/gameContext";
import { LEADERBOARD_RANGES, type LeaderboardRange } from "@/app/_lib/results";
import type { WordSet } from "@/app/_lib/typing/words";

type Props = {
  range: LeaderboardRange; time: number; words: WordSet;
  onChange: (key: string, value: string) => void;
};

export default function LeaderboardFilter({ range, time, words, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-4 bg-base-200 rounded-2xl p-4">
      <label className="flex flex-col gap-1">Period<select
        className="select bg-base-100"
        value={range}
        onChange={(e) => onChange("range", e.target.value)}
      >{LEADERBOARD_RANGES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="flex flex-col gap-1">Duration<select
        className="select bg-base-100"
        value={time}
        onChange={(e) => onChange("time", e.target.value)}
      >{TIME_OPTIONS.map((value) => <option
        key={value}
        value={value}
      >{value} seconds</option>)}</select></label>
      <label className="flex flex-col gap-1">Word set<select
        className="select bg-base-100"
        value={words}
        onChange={(e) => onChange("words", e.target.value)}
      >
        <option value="1k">1,000 common words</option>
        <option value="5k">5,000 common words</option>
      </select></label>
    </div>
  );
}
