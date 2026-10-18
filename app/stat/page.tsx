"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../_lib/userContext";
import { getResults } from "../_lib/getResults";
import { matchingResults, type ResultDoc } from "../_lib/results";
import { COUNT_OPTIONS, TIME_OPTIONS, type GameMode } from "../_lib/gameContext";
import Profile from "./_components/Profile";
import Summary from "./_components/Summary";
import Table from "./_components/Table";
import ProgressChart from "./_components/ProgressChart";

function StatsPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const [loaded, setLoaded] = useState<{ uid: string; results: ResultDoc[] } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const mode = params.get("mode") === "words" ? "Star Count" : "Rocket Run";
  const time = Number(params.get("time") ?? 30);
  const count = Number(params.get("count") ?? 50);
  const settings: GameMode = {
    start: false, mode, words: params.get("words") === "5k" ? "5k" : "1k",
    time: TIME_OPTIONS.includes(time as 15 | 30 | 60) ? time : 30,
    count: COUNT_OPTIONS.includes(count as 20 | 50 | 100) ? count : 50,
  };

  useEffect(() => {
    if (!authLoading && !user) router.replace("/user");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setError(false);
    getResults().then((results) => {
      if (!cancelled) setLoaded({ uid: user.uid, results });
    }).catch((error) => {
      console.error("Failed to load history", error);
      if (!cancelled) setError(true);
    });
    return () => { cancelled = true; };
  }, [user, attempt]);

  function change(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.replace("/stat?" + next.toString(), { scroll: false });
  }

  if (authLoading || !user) return <p role="status" className="p-10 text-center">Checking your account…</p>;
  if (error) return <div
    role="alert"
    className="p-10 text-center"
  >
    <p>Couldn’t load your history.</p>
    <button
      className="btn mt-3"
      onClick={() => setAttempt((value) => value + 1)}
    >Try again</button>
  </div>;
  if (loaded?.uid !== user.uid) return <p role="status" className="p-10 text-center">Loading your progress…</p>;
  const history = loaded.results;
  const comparable = matchingResults(history, settings);

  return (
    <div className="w-[92%] max-w-6xl mx-auto my-6 space-y-6 text-base-content">
      <h1 className="text-3xl">Your progress</h1>
      <Profile results={history} />
      {!history.length ? (
        <section className="bg-base-200 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl">Your first result starts here</h2>
          <p>Finish a test to start tracking your speed and accuracy.</p>
          <Link href="/app" className="btn btn-primary">Start a typing test</Link>
        </section>
      ) : <>
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1">Mode<select
            className="select bg-base-200"
            value={mode === "Rocket Run" ? "timed" : "words"}
            onChange={(e) => change("mode", e.target.value)}
          >
            <option value="timed">Timed · Rocket Run</option>
            <option value="words">Words · Star Count</option>
          </select></label>
          <label className="flex flex-col gap-1">{mode === "Rocket Run" ? "Duration" : "Word count"}
            <select
              className="select bg-base-200"
              value={mode === "Rocket Run" ? settings.time! : settings.count!}
              onChange={(e) => change(mode === "Rocket Run" ? "time" : "count", e.target.value)}
            >{(mode === "Rocket Run" ? TIME_OPTIONS : COUNT_OPTIONS).map((value) => <option
              key={value}
              value={value}
            >{value}{mode === "Rocket Run" ? " seconds" : " words"}</option>)}</select>
          </label>
          <label className="flex flex-col gap-1">Word set<select
            className="select bg-base-200"
            value={settings.words!}
            onChange={(e) => change("words", e.target.value)}
          >
            <option value="1k">1,000 common words</option>
            <option value="5k">5,000 common words</option>
          </select></label>
        </div>
        <p className="text-sm text-base-content/70">Comparisons use standard tests with these settings and the current scoring rules. Legacy results and practice stay in your history below.</p>
        {comparable.length ? <><Summary results={comparable} /><ProgressChart results={comparable} /></> : <p className="bg-base-200 rounded-2xl p-6">No comparable tests yet. <Link
          className="link"
          href="/app"
        >Take a test</Link> to start this progress chart.</p>}
        <h2 className="text-xl">All test history</h2>
        <Table results={history} />
      </>}
    </div>
  );
}

export default function User() {
  return <Suspense fallback={<p className="p-10 text-center">Loading progress…</p>}>
    <StatsPage />
  </Suspense>;
}
