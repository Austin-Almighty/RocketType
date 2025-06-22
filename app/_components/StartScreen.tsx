
import { useEffect } from "react";
import { useGameContext } from "../_lib/gameContext";
import SpaceShuttle from "@/components/svgs/SpaceShuttle";

import { unstable_ViewTransition as ViewTransition } from "react";

export default function StartScreen({onStart}: { onStart: () => void}) {
    const { gameMode, setGameMode } = useGameContext();

    //monitor the press space to start function
    useEffect(() => {
      if (!gameMode.start) return;

      function handleStart(e: KeyboardEvent) {
        if (e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setGameMode(prev => ({
            ...prev,
            start: true,
          }));
          onStart();
        }
      }

      document.addEventListener("keydown", handleStart);
      return () => {
        document.removeEventListener("keydown", handleStart);
       
      };
    }, [gameMode.start, setGameMode, onStart]);


  


      return (
          <div className="w-full flex items-center justify-center bg-base-100 flex-col">
            <ViewTransition name="shuttle" onUpdate={(instance)=>{
              instance.old.animate({
                transform: ["scale(1)", "scale(0)"],
                opacity: [1, 0]
              }, {duration: 700})

              instance.new.animate({
                transform: ["scale(0)", "scale(1)"],
                opacity: [0, 1]
              }, {duration: 700})
            }}>
              <div className="rotate-270 absolute top-[30vh]">
                <SpaceShuttle flying={gameMode.start} thrust={true}/>
              </div>
            </ViewTransition>

              <h2 className="text-base-content md:text-3xl text-center absolute top-[60vh] animate-pulse">{!(gameMode.start) ? "Preparing for Launch" : "Ready for Launch!"}</h2>
              <h2 className="text-base-content md:text-3xl text-center absolute top-[65vh] animate-pulse">{!(gameMode.start) ? "Select Your Settings" : "Press Space to Start"}</h2>

              
          </div>
      )
  }