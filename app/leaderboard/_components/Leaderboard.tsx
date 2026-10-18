"use client";
import { useEffect, useState } from "react";
import { getLeaderboardResults } from "./getLeaderboardDB";
import { useUser } from "@/app/_lib/userContext";
import type { LeaderboardRange, ResultDoc } from "@/app/_lib/results";
import type { WordSet } from "@/app/_lib/typing/words";

type Props = { range: LeaderboardRange; time: number; words: WordSet };

export default function Leaderboard({ range, time, words }: Props) {
  const { user } = useUser();
  const [results, setResults] = useState<ResultDoc[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);
  useEffect(() => {
    let cancelled = false;
    setError(false);
    getLeaderboardResults(range, time, words).then((data) => {
      if (!cancelled) setResults(data);
    }).catch((error) => {
      console.error("Failed to load leaderboard", error);
      if (!cancelled) setError(true);
    });
    return () => { cancelled = true; };
  }, [range, time, words, attempt]);
  if (error) return <div
    role="alert"
    className="bg-base-200 p-6 rounded-2xl"
  >
    <p>Couldn’t load the leaderboard.</p>
    <button
      className="btn mt-3"
      onClick={() => setAttempt((value) => value + 1)}
    >Try again</button>
  </div>;
  if (!results) return <p role="status" className="p-6">Loading leaderboard…</p>;
  if (!results.length) return <p className="bg-base-200 p-6 rounded-2xl">No qualifying results yet. Finish a timed test with these settings to join the leaderboard.</p>;
  const pages = Math.max(1, Math.ceil(results.length / 10));
  const ownRank = results.findIndex((result) => result.userUID === user?.uid);
  return (
    <section className="space-y-4">
      {ownRank >= 0 && <p className="text-primary">Your rank: {ownRank + 1} of {results.length}</p>}
      <div className="overflow-x-auto">
        <table className="table tabular-nums">
          <caption className="sr-only">One best result per player. Ties use accuracy, then earliest completion.</caption>
          <thead>
            <tr>{["Rank", "Player", "WPM", "Accuracy", "Raw", "Completed"].map((label) => <th
              key={label}
              scope="col"
            >{label}</th>)}</tr>
          </thead>
          <tbody>{results.slice((page - 1) * 10, page * 10).map((result, index) => <tr
            key={result.id}
            className={result.userUID === user?.uid ? "bg-primary/10" : ""}
          >
            <td>{(page - 1) * 10 + index + 1}</td>
            <td className="max-w-64 break-words">{result.userDisplayName || "Anonymous typist"}{result.userUID === user?.uid && " (you)"}</td>
            <td>{result.wpm}</td>
            <td>{result.accuracy}%</td>
            <td>{result.raw}</td>
            <td className="whitespace-nowrap">{result.createdAt?.toDate().toLocaleString()}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <nav aria-label="Leaderboard pages" className="flex flex-wrap justify-center items-center gap-4">
        <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span aria-live="polite">Page {page} of {pages}</span>
        <button className="btn btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </nav>
      <p className="text-sm text-base-content/60">Current scoring rules only. Ties use accuracy, then earliest completion.</p>
    </section>
  );
}
