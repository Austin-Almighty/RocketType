'use client';
import { useState } from "react";
import StartScreen from "../_components/StartScreen";
import App from "../_components/App";
import Settings from "../_components/Settings";
import { useGameContext } from "../_lib/gameContext";


export default function Home() {
  // const searchParams = useSearchParams();
  // const autostart = searchParams.get('autostart') === '1';
  const [appInstance, setAppInstance] = useState<number | null>(null);
  const { setTrackBySecond } = useGameContext();

  function handleStart() {
    setTrackBySecond([]);
    setAppInstance((prev) => (prev === null ? 1 : prev + 1));
  }

  function handleRestart() {
    setTrackBySecond([]);
    setAppInstance((prev) => (prev === null ? 1 : prev + 1));
  }

  // function handleHomePage() {
  //   setTrackBySecond([]);
  //   setAppInstance(null);
  // }

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
    <div className="bg-base-100 flex flex-col items-center w-screen">
      {/* <Header reStart={handleHomePage}/> */}
      {renderContent()}
    </div>
  );
}