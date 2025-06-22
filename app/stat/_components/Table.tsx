import { useEffect, useState } from "react";
import { getResults } from "@/app/_lib/getResults";

export default function Table() {
  const [results, setResults] = useState<any[] | null>(null);

  useEffect(() => {
    async function fetchResults() {
      const res = await getResults();
      setResults(res);
    }
    fetchResults();
  }, []);

  function renderResults() {
    if (!results || results.length === 0) {
      return (
        <tr>
          <th>No Records</th>
        </tr>
      );
    } else {
      return results.map((result, i) => (
        <tr key={i} className="odd:text-base-content even:text-primary">
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
    </div>
  );
}
