import { MouseEventHandler, useState, useEffect, useRef } from "react";
import { Clock } from "./Clock";
import WordCounter from "./WordCounter";
import Typing from "./TimeMode";
import WordCountMode from "./WordCountMode";
import ZenMode from "./ZenMode";

// import Keyboard from "./Keyboard";
// import WpmCounter from "./WpmCounter";
import { useGameContext } from "../_lib/gameContext";
import { useRouter } from "next/navigation";
import resultToDB from "../_lib/resultToFirebase";

import { auth } from "../_lib/Firebase";
import { GrPowerReset } from "react-icons/gr";
import { IoMdReturnLeft } from "react-icons/io";



export default function App({ reStart, goHome }: { reStart: MouseEventHandler, goHome: () => void }) {
  const [keyCount, setKeyCount] = useState(0); //總按鍵數
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // const [wpm, setWpm] = useState(0);
  // const [raw, setRaw] = useState(0);
  const [instantRaw, setInstantRaw] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [completeWords, setCompleteWords] = useState(0);
  const prevKeyCountRef = useRef(0);
  const { gameMode, setTrackBySecond, setGameMode, trackBySecond } = useGameContext();
  const user = auth.currentUser;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!gameMode.start || !hasStarted) {
      setElapsedSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode.start, hasStarted]);

  //Monitor Time
  useEffect(() => {
    // Only trigger onTestEnd when in "time" mode
    if (gameMode.mode !== "Rocket Run") return;
    if (!gameMode.time) return;
    if (elapsedSeconds >= gameMode.time) {
      onTestEnd();
    }
  }, [elapsedSeconds, gameMode.time, gameMode.mode]);

  // Only update keyCount on keydown
  useEffect(() => {
    const target = typingRef.current; //偵測打字的位置
    if (!target) return;

    function totalKeyPress(e: KeyboardEvent) {
      if (e.key.length === 1) {
        setKeyCount((prev) => prev + 1);
        if (!hasStarted) {
          setHasStarted(true);
        }
      }
    }
    target.addEventListener("keydown", totalKeyPress);
    return () => {
      target.removeEventListener("keydown", totalKeyPress); //回傳函式：結束時移除監聽
    };
  }, [setKeyCount, typingRef, hasStarted]); //打字位置有變時重新執行

  //每秒紀錄數據
  useEffect(() => {
    if (!gameMode.start) return;
    if (elapsedSeconds === 0 || keyCount === 0) return;

    const keystrokesThisSecond = keyCount - prevKeyCountRef.current;
    const newRaw = keystrokesThisSecond > 0 ? Math.floor((keystrokesThisSecond/5)*60):0;

    setInstantRaw(newRaw);
    prevKeyCountRef.current = keyCount;
    const adjustedWpm = Math.floor(((keyCount - mistakes) / 5) / (elapsedSeconds / 60));

    setTrackBySecond((prev) => [
      ...prev,
      { keyCount, wpm: adjustedWpm, raw: newRaw, mistakes, elapsedSeconds },
    ]);

  }, [elapsedSeconds, gameMode.start]);

  const onTestEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameMode((prev: any) => ({
      ...prev,
      start: false,
    }));
    setHasStarted(false);
    if (user) resultToDB({ trackBySecond, gameMode, user });
    router.push("/result");
  };

  return (
    <>
      {/* <div>
        <WpmCounter
          mistakes={mistakes}
          keyCount={keyCount}
          elapsedSeconds={elapsedSeconds}
          setWpm={setWpm}
          setRaw={setRaw}
          instantRaw={instantRaw}
          wpm={wpm}
          raw={raw}
        />
      </div> */}
      <div className="w-[85%] sm:w-3/4 mx-auto absolute top-[30vh] text-primary-content">
        {gameMode.mode === "Rocket Run" && <Clock start={gameMode.time} running={hasStarted} />}
        {(gameMode.mode === "Star Count" || gameMode.mode === "Zen") && <WordCounter complete={completeWords}/>}
        {gameMode.mode === "Rocket Run" && <Typing ref={typingRef} setMistakes={setMistakes} />}
        {gameMode.mode === "Star Count" && <WordCountMode setMistakes={setMistakes} onTestEnd={onTestEnd} ref={typingRef} setCompleteWords={setCompleteWords}/>}
        {gameMode.mode === "Zen" && (
          <ZenMode ref={typingRef} setCompleteWords={setCompleteWords} />
        )}

        <div className="flex absolute translate-x-[-50%] left-[50%] text-base-content justify-center gap-20 min-w-[50%]" data-tip="Restart Test">
          <div className="tooltip tooltip-bottom" data-tip="Restart">
            <GrPowerReset className="w-10 h-10 fill-base-content" onClick={reStart}/>
          </div>  
          <div className="tooltip tooltip-bottom" data-tip="Back">
            <IoMdReturnLeft className="w-10 h-10 fill-base-content" onClick={goHome}/>
          </div>
        </div>
      </div>
    </>
  );
}
