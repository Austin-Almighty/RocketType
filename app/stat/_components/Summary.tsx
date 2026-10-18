import { summarizeResults, type ResultDoc } from "@/app/_lib/results";

export default function Summary({ results }: { results: ResultDoc[] }) {
  const summary = summarizeResults(results);
  if (!summary) return null;
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
      {[["Personal best", summary.best + " wpm"], ["Recent average", summary.recentAverage + " wpm"],
      ["Recent accuracy", summary.accuracy + "%"], ["Matching tests", summary.completed]].map(([label, value]) => (
        <div
          key={label}
          className="bg-base-200 p-4 rounded-2xl"
        >
          <dt className="text-sm text-base-content/90">{label}</dt>
          <dd className="text-2xl mt-2">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
