'use client';
import { getLeaderboardResults } from "./getLeaderboardDB";
import { useState, useEffect, startTransition} from "react";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function Leaderboard({
  range,
  time,
}: {
  range: string;
  time: string;
}) {

    const [docs, setDocs] = useState<any[] | null>(null);  
    const [loading, setLoading] = useState(true); 
    
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
      return docs.map((doc, i) => (
        <tr key={i} className="odd:text-base-content even:text-primary w-full">
          <th>{i + 1}</th>
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
    </div>
  );
}
