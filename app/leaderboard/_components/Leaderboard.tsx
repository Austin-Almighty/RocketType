'use client';
import { getLeaderboardResults } from "./getLeaderboardDB";
import { useState, useEffect } from "react";

export default function Leaderboard({
  range,
  time,
}: {
  range: string;
  time: string;
}) {

    const [docs, setDocs] = useState<any[] | null>(null);   
    
    useEffect(() => {
        async function fetchResults() {
            const res = await getLeaderboardResults(range, time);
            setDocs(res);
        }
        fetchResults();
    }, [range, time]);


  function renderLeaderBoard() {
    if (!docs || docs.length === 0) {
      return (
        <tr>
          <th>No Records</th>
        </tr>
      );
    } else {
      return docs.map((doc, i) => (
        <tr key={i} className="odd:text-base-content even:text-primary">
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
        <tbody className="rounded-2x1">{renderLeaderBoard()}</tbody>
      </table>
    </div>
  );
}
