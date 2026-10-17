'use client';
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StartScreen from "../_components/StartScreen";
import App from "../_components/App";
import Settings from "../_components/Settings";
import { settingsReady, useGameContext } from "../_lib/gameContext";

function Home() {
  const [appInstance, setAppInstance] = useState<number | null>(null);
  const { gameMode, setGameMode, setTrackBySecond } = useGameContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const autostart = searchParams.get("autostart") === "1";

  // "Restart" on the result page lands here with ?autostart=1 and goes
  // straight into a new test with the same settings.
  useEffect(() => {
    if (!autostart) return;
    router.replace("/app");
    if (!settingsReady(gameMode)) return;
    setGameMode((prev) => ({ ...prev, start: true }));
    setTrackBySecond([]);
    setAppInstance((prev) => (prev === null ? 1 : prev + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart]);

  function handleStart() {
    setTrackBySecond([]);
    setAppInstance((prev) => (prev === null ? 1 : prev + 1));
  }

  function handleRestart() {
    setTrackBySecond([]);
    setAppInstance((prev) => (prev === null ? 1 : prev + 1));
  }

  function handleHomePage() {
    setTrackBySecond([]);
    setAppInstance(null);
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
    <div className="bg-base-100 flex flex-col items-center w-screen">
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
