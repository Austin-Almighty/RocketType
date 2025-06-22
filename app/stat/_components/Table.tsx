import { useEffect, useState } from "react";
import { getResults } from "@/app/_lib/getResults";

export default function Table() {
  const [results, setResults] = useState<any[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    async function fetchResults() {
      const res = await getResults();
      setResults(res);
    }
    fetchResults();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [results]);

  function renderResults() {
    if (!results || results.length === 0) {
      return (
        <tr>
          <th>No Records</th>
        </tr>
      );
    } else {
      const startIndex = (currentPage - 1) * pageSize;
      const currentResults = results.slice(startIndex, startIndex + pageSize);
      return currentResults.map((result, i) => (
        <tr key={startIndex + i} className="odd:text-base-content even:text-primary">
          <th></th>
          <th>{result.wpm}</th>
          <th>{result.raw}</th>
          <th>{result.accuracy}%</th>
          <th>{`${result.keyCount}/${result.errors}`}</th>
          <th>{result.gameMode}</th>
          <th>{result.createdAt.toDate().toLocaleString()}</th>
        </tr>
      ));
    }
  }

  const totalPages = results ? Math.ceil(results.length / pageSize) : 1;

  return (
    <div className="overflow-x-auto w-[90%] ">
      <table className="table table-zebra">
        <thead className="text-base-content">
          <tr>
            <th></th>
            <th>WPM</th>
            <th>raw</th>
            <th>Accuracy</th>
            <th>chars</th>
            <th>Mode</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody className="rounded-2x1">{renderResults()}</tbody>
      </table>
      <div className="flex join justify-center items-center mt-4 space-x-4">
        <button
          className="btn join-item"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          «
        </button>
        <button className="btn join-item">
          Page {currentPage} of {totalPages}
        </button>
        <button
          className="btn join-item"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          »
        </button>
      </div>
    </div>
  );
}
