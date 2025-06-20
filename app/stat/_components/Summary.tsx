import { getSummaryStats } from "@/app/_lib/getResults";
import { useEffect, useState } from "react";

type Stats = {
  DaysSinceCreation: number;
  highestWPM: number;
  averageWPM: number;
  completed: number;
  timeTyping: number;
  averageWPMLast10: number;
  highestRAW: number;
  averageRAW: number;
  averageRAWLast10: number;
  highestAccuracy: number;
  averageAccuracy: number;
  averageAccuracyLast10: number;
};
type SummaryProps = {
  stats: Stats | null;
};

export default function Summary({stats}: SummaryProps) {
  // const [stats, setStats] = useState<null | {
  //   highestWPM: number,
  //   averageWPM: number,
  //   completed: number,
  //   timeTyping: number,
  //   averageWPMLast10: number,
  //   highestRAW: number,
  //   averageRAW: number,
  //   averageRAWLast10: number,
  //   highestAccuracy: number,
  //   averageAccuracy: number,
  //   averageAccuracyLast10: number,
  // }>(null);

  // useEffect(()=>{
  //   getSummaryStats().then(setStats);
  // }, []);

  function formatSeconds(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    // Pad with zeros
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  }
  

  return (
    <div className="grid grid-cols-3 grid-rows-4 gap-4 bg-transparent p-4 rounded-lg w-[90%] text-base-content">
      {/* Row 1 */}
      <div className="bg-base-200 rounded shadow p-2">
        <div>Days Since Joined</div>
        <div>{stats ? stats.DaysSinceCreation : "No Data Available"}</div>
      </div>
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Test Completed</div>
        <div>{stats ? stats.completed : "No Data Available"}</div>
      </div>
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Time Typing</div>
        <div>{stats ? formatSeconds(stats.timeTyping) : "No Data Available"}</div>
      </div>
      {/* Row 2 */}
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Highest WPM</div>
        <div>{stats ? stats.highestWPM : "No Data Available"}</div>
      </div>
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Average WPM</div>
        <div>{stats ? stats.averageWPM : "No Data Available"}</div>
      </div>
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Average WPM (last 10 tests)</div>
        <div>{stats ? stats.averageWPMLast10 : "No Data Available"}</div>
      </div>
      {/* Row 3 */}
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Highest raw WPM</div>
        <div>{stats ? stats.highestRAW : "No Data Available"}</div>
      </div>
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Average raw WPM</div>
        <div>{stats ? stats.averageRAW : "No Data Available"}</div>
      </div>
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Average raw WPM (last 10 tests)</div>
        <div>{stats ? stats.averageRAWLast10 : "No Data Available"}</div>
      </div>
      {/* Row 4 */}
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Highest Accuracy</div>
        <div>{stats ? `${stats.highestAccuracy}%` : "No Data Available"}</div>
      </div>
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Average Accuracy</div>
        <div>{stats ? `${stats.averageAccuracy}%` : "No Data Available"}</div>
      </div>
      <div className="bg-base-200 p-2 rounded shadow">
        <div>Average Accuracy (last 10 tests)</div>
        <div>{stats ? `${stats.averageAccuracyLast10}%` : "No Data Available"}</div>
      </div>
    </div>
  );
}
