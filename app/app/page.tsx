'use client';
import { flushSync } from "react-dom";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StartScreen from "../_components/StartScreen";
import App from "../_components/App";
import Settings from "../_components/Settings";
import { settingsReady, useGameContext } from "../_lib/gameContext";

function Home() {
  const [appInstance, setAppInstance] = useState<number | null>(null);
  const { gameMode, setGameMode, setTrackBySecond, settingsLoaded, practiceWords, setPracticeWords, setTestDetails } = useGameContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const practice = searchParams.get("practice") === "1";
  const autostart = searchParams.get("autostart") === "1";

  // "Restart" on the result page lands here with ?autostart=1 and goes
  // straight into a new test with the same settings.
  useEffect(() => {
    if (!autostart || !settingsLoaded) return;
    router.replace("/app");
    if (!settingsReady(gameMode) || (practice && !practiceWords?.length)) return;
    if (!practice) setPracticeWords(null);
    setGameMode((prev) => ({ ...prev, start: true }));
    setTrackBySecond([]);
    setAppInstance((prev) => (prev === null ? 1 : prev + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, settingsLoaded]);

  function handleStart() {
    flushSync(() => {
      setPracticeWords(null);
      setTestDetails(null);
      setTrackBySecond([]);
      setGameMode((prev) => ({ ...prev, start: true }));
      setAppInstance((prev) => (prev === null ? 1 : prev + 1));
    });
    // Mount and focus in the tap gesture so mobile keyboards can open.
    document.querySelector<HTMLTextAreaElement>("[data-typing-input]")?.focus({ preventScroll: true });
  }

  function handleRestart() {
    flushSync(() => {
      setTrackBySecond([]);
      setTestDetails(null);
      setAppInstance((prev) => (prev === null ? 1 : prev + 1));
    });
    document.querySelector<HTMLTextAreaElement>("[data-typing-input]")?.focus({ preventScroll: true });
  }

  function handleHomePage() {
    setTrackBySecond([]);
    setPracticeWords(null);
    setAppInstance(null);
    setGameMode((prev) => ({ ...prev, start: false }));
  }

  function renderContent() {
    if (appInstance !== null) {
      return <App key={appInstance} reStart={handleRestart} goHome={handleHomePage} />;
    }
    // Not started yet
    return (
      <>
        <Settings />
        <StartScreen onStart={handleStart} />
      </>
    );
  }

  return (
    <div className="bg-base-100 flex flex-col items-center w-full pt-4">
      {renderContent()}
    </div>
  );
}

// useSearchParams needs a Suspense boundary for Next.js static rendering.
export default function HomePage() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
