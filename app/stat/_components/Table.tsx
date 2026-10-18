import { useState } from "react";
import type { ResultDoc } from "@/app/_lib/results";
import { SCORING_VERSION } from "@/app/_lib/typing/stats";

export default function Table({ results }: { results: ResultDoc[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(results.length / 10));
  const page = Math.min(currentPage, totalPages);
  return (
    <section>
      <div className="overflow-x-auto">
        <table className="table tabular-nums">
          <caption className="sr-only">All completed tests, including legacy scores and practice</caption>
          <thead>
            <tr>{["WPM", "Raw", "Accuracy", "Test", "Scoring", "Date"].map((label) => <th
              scope="col"
              key={label}
            >{label}</th>)}</tr>
          </thead>
          <tbody>{results.slice((page - 1) * 10, page * 10).map((result) => <tr key={result.id}>
            <td>{result.wpm}</td>
            <td>{result.raw}</td>
            <td>{result.accuracy}%</td>
            <td>{result.testKind === "practice" ? "Practice" : result.gameMode} · {result.gameMode === "Rocket Run" && result.testKind !== "practice" ? result.time + "s" : (result.testKind === "practice" ? "missed words" : result.count + " words")} · {result.words}</td>
            <td>{result.scoringVersion === SCORING_VERSION ? "Current" : "Legacy"}</td>
            <td className="whitespace-nowrap">{result.createdAt?.toDate().toLocaleString() ?? "Pending date"}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <nav aria-label="History pages" className="flex justify-center items-center gap-4 mt-4">
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => setCurrentPage(page - 1)}>Previous</button>
        <span aria-live="polite">Page {page} of {totalPages}</span>
        <button
          className="btn btn-sm"
          disabled={page >= totalPages}
          onClick={() => setCurrentPage(page + 1)}
        >Next</button>
      </nav>
    </section>
  );
}
