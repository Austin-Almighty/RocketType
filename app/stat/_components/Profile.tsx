"use client";
import { useUser } from "@/app/_lib/userContext";
import type { ResultDoc } from "@/app/_lib/results";

export default function Profile({ results }: { results: ResultDoc[] }) {
  const { user } = useUser();
  const seconds = Math.floor(results.reduce((sum, result) => sum + (result.elapsedSeconds ?? 0), 0));
  const incomplete = results.some((result) => result.elapsedSeconds === undefined);
  return (
    <section className="flex flex-wrap items-center justify-between gap-6 bg-base-200 rounded-2xl p-5">
      <div className="min-w-0">
        <h2 className="text-xl break-words">{user?.displayName || "Your typing journey"}</h2>
        {user?.metadata.creationTime && <p className="text-sm text-base-content/70">Joined {new Date(user.metadata.creationTime).toLocaleDateString()}</p>}
      </div>
      <dl className="flex flex-wrap gap-8 text-sm tabular-nums">
        <div>
          <dt className="text-base-content/70">Lifetime tests</dt>
          <dd className="text-lg">{results.length}</dd>
        </div>
        <div>
          <dt className="text-base-content/70">Recorded typing time</dt>
          <dd className="text-lg">{Math.floor(seconds / 3600)}h {Math.floor(seconds % 3600 / 60)}m {seconds % 60}s</dd>{incomplete && <p className="text-xs text-base-content/60">Legacy durations unavailable</p>}
        </div>
      </dl>
    </section>
  );
}
