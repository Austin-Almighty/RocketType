'use client';
import { getLeaderboardResults } from "./getLeaderboardDB";
import { useState, useEffect, startTransition} from "react";
import { unstable_ViewTransition as ViewTransition } from "react";
import { useInfiniteQuery } from "@tanstack/react-query"

export default function Leaderboard({
  range,
  time,
}: {
  range: string;
  time: string;
}) {

    const [docs, setDocs] = useState<any[] | null>(null);  
    const [loading, setLoading] = useState(true); 
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
      setCurrentPage(1);
    }, [docs]);

    useEffect(() => {
        setLoading(true);
        const minDelay = 1000;
        const start = Date.now();

       
        async function fetchResults() {
            const res = await getLeaderboardResults(range, time);
            setDocs(res);
            const elapsed = Date.now() - start;
            const wait = minDelay - elapsed;
            if (wait > 0) {
                setTimeout(()=> setLoading(false), wait);
            } else {
                setLoading(false);
            }
        }
        fetchResults();
    }, [range, time]);


  function renderLeaderBoard() {
    if (!docs || docs.length === 0) {
      return (
        <tr>
          <td colSpan={6}>No Records</td>
        </tr>
      );
    } else {
      const startIndex = (currentPage - 1) * pageSize;
      const currentDocs = docs.slice(startIndex, startIndex + pageSize);
      return currentDocs.map((doc, i) => (
        <tr key={startIndex + i} className="odd:text-base-content even:text-primary w-full">
          <th>{startIndex + i + 1}</th>
          <th>{doc.userDisplayName}</th>
          <th>{doc.wpm}</th>
          <th>{doc.accuracy}%</th>
          <th>{doc.raw}</th>
          <th>{doc.createdAt.toDate().toLocaleString()}</th>
        </tr>
      ));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 w-full py-8 text-center align-middle">
        <span className="loading loading-infinity loading-xl text-warning"></span>
        <div>Loading...</div>
      </div>
    );
  }

  const totalPages = docs ? Math.ceil(docs.length / pageSize) : 1;

  return (
    <div className="overflow-x-auto w-full">
      <table className="table table-zebra">
        <thead className="text-base-content">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>WPM</th>
            <th>Accuracy</th>
            <th>raw</th>
            <th>Date</th>
          </tr>
        </thead>
        <ViewTransition>
         <tbody className="rounded-2x1">{renderLeaderBoard()}</tbody>
        </ViewTransition>
      </table>
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          className="btn btn-sm"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-sm"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}