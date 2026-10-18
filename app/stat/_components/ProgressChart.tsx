"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ResultDoc } from "@/app/_lib/results";

export default function ProgressChart({ results }: { results: ResultDoc[] }) {
  const data = [...results].reverse().map((result, index) => ({
    test: index + 1, wpm: result.wpm, date: result.createdAt?.toDate().toLocaleDateString() ?? "Date unavailable",
  }));
  return (
    <section className="bg-base-200 rounded-2xl p-4 sm:p-6">
      <h2 className="text-xl mb-4">Speed over time</h2>
      <div
        className="h-64 sm:h-80"
        role="img"
        aria-label="WPM for matching tests, oldest to newest. Values are available below."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 15, bottom: 10 }}>
            <CartesianGrid vertical={false} stroke="var(--color-base-content)" opacity={0.12} />
            <XAxis
              dataKey="test"
              tick={{ fill: "var(--color-base-content)" }}
              label={{ value: "Test number", position: "insideBottom", offset: -8, fill: "var(--color-base-content)" }}
            />
            <YAxis width={45} tick={{ fill: "var(--color-base-content)" }} />
            <Tooltip
              labelFormatter={(_, payload) => payload[0]?.payload.date}
              contentStyle={{ background: "var(--color-base-100)", color: "var(--color-base-content)", borderRadius: 12 }}
            />
            <Line
              name="WPM"
              dataKey="wpm"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={data.length < 30}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm">View chart values</summary>
        <div className="max-h-64 overflow-auto">
          <table className="table table-sm tabular-nums">
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Date</th>
                <th scope="col">WPM</th>
              </tr>
            </thead>
            <tbody>{data.map((point) => <tr key={point.test}>
              <td>{point.test}</td>
              <td>{point.date}</td>
              <td>{point.wpm}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
