import { MouseEventHandler, useState, useEffect, useRef } from "react";
import { Clock } from "./Clock";
import Typing from "./TimeMode";
// import Keyboard from "./Keyboard";
import WpmCounter from "./WpmCounter";
import { useGameContext } from "../_lib/gameContext";
import { useRouter } from "next/navigation";

export default function App({ onStart }: { onStart: MouseEventHandler }) {
  const [keyCount, setKeyCount] = useState(0); //總按鍵數
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [raw, setRaw] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [instantRaw, setInstantRaw] = useState<number | null>(null);
  const prevKeyCountRef = useRef(0);
  const { gameMode, setTrackBySecond, setGameMode } = useGameContext();


  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();



  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  //Monitor Time
  useEffect(() => {
    // Don't do anything if no valid time set
    if (!gameMode.time) return;
    
    // When time is up
    if (elapsedSeconds >= gameMode.time) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameMode(prev=>({
        ...prev,
        start: false
      }))
      router.push("/result");
    }
  }, [elapsedSeconds, gameMode.time, router]);

  // Only update keyCount on keydown
  useEffect(() => {
    const target = typingRef.current; //偵測打字的位置
    if (!target) return;

    function totalKeyPress(e: KeyboardEvent) {
      if (e.key.length === 1) {
        setKeyCount((prev) => prev + 1);
        setHasStarted(true);
      }
    }
    target.addEventListener("keydown", totalKeyPress);
    return () => {
      target.removeEventListener("keydown", totalKeyPress); //回傳函式：結束時移除監聽
    };
  }, [setKeyCount, typingRef, setHasStarted, hasStarted]); //打字位置有變時重新執行

  //Record the result by second
 useEffect(() => {
   if (!hasStarted) return;
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

 }, [elapsedSeconds, hasStarted]);

  return (
    <>
      <div>
        <WpmCounter
          mistakes={mistakes}
          keyCount={keyCount}
          elapsedSeconds={elapsedSeconds}
          setWpm={setWpm}
          setRaw={setRaw}
          instantRaw={instantRaw}
        />
      </div>
      <div className="w-3/4 mx-auto absolute top-[30vh]">
        <Clock start={gameMode.time} />

        <Typing ref={typingRef} setMistakes={setMistakes} />
        <svg
          // width="70px"
          // height="70px"
          viewBox="0 0 24 24"
          fill="none"
          className="w-16 h-16 cursor-pointer hover:animate-spin absolute translate-x-[-50%] left-[50%]"
          onClick={onStart}
        >
          <circle cx="12" cy="12" r="10" stroke="#1C274C" strokeWidth="1.5" />
          <path
            d="M15.9775 8.71452L15.5355 8.2621C13.5829 6.26318 10.4171 6.26318 8.46447 8.2621C6.51184 10.261 6.51184 13.5019 8.46447 15.5008C10.4171 17.4997 13.5829 17.4997 15.5355 15.5008C16.671 14.3384 17.1462 12.7559 16.9611 11.242M15.9775 8.71452H13.3258M15.9775 8.71452V6"
            stroke="#1C274C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
