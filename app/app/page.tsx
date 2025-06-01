'use client';
import { useState, useEffect } from "react";
import Header from "../_components/Header"
import StartScreen from "../_components/StartScreen";
import App from "../_components/App";
import Settings from "../_components/Settings";
import { useGameContext } from "../_lib/gameContext";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const autostart = searchParams.get('autostart') === '1';
  const [appInstance, setAppInstance] = useState<number | null>(autostart ? 1 : null);
  const { setTrackBySecond } = useGameContext();

  useEffect(() => {
    if (autostart) {
      setTrackBySecond([]);
      setAppInstance(prev => (prev === null ? 1 : prev + 1));
      // Optionally, remove the query param for a cleaner URL after autostart:
      // router.replace("/app");
    }
  }, [autostart, setTrackBySecond]);


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
      return <App key={appInstance} reStart={handleRestart} />;
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
    <div className="bg-amber-100 h-screen flex flex-col items-center w-screen">
      <Header reStart={handleHomePage}/>
      {renderContent()}
    </div>
  );
}