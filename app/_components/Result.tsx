"use client"
import ResultChart from "./ResultChart"
import { useGameContext } from "../_lib/gameContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import html2canvas from 'html2canvas-pro';
import { MdOutlineRestartAlt } from "react-icons/md";
import { MdSimCardDownload } from "react-icons/md";





export default function Result() {
    const router = useRouter();

    const { trackBySecond, gameMode, resetGame } = useGameContext();

    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    async function screenshotAndCopy() {
        const canvas = await html2canvas(document.body);

        canvas.toBlob(async (blob) => {
            if (blob) {
                try {
                    await navigator.clipboard.write([
                        new window.ClipboardItem({"image/png": blob})
                    ]);
                    setAlertMessage("screenshot copied to clipboard!")
                } catch (e) {
                    setAlertMessage("Failed to copy screenshot:" + e);
                }
            }
        }, "image/png");
    }

    useEffect(() => {
      if (trackBySecond.length === 0) {
        router.push("/app");
      }
    }, [trackBySecond, router]);

    if (trackBySecond.length === 0) {
        return null;
    }

    
    let accuracy = "0.0";
    const latest = trackBySecond[trackBySecond.length - 1];
    if (latest && latest.keyCount > 0) {
      const correct = latest.keyCount - latest.mistakes;
      accuracy = ((correct / latest.keyCount) * 100).toFixed(1); 
    }

    

    function reStartGame() {
        resetGame();
        router.push("/app?autostart=1")
    }

    return (
        <>
            {alertMessage && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-fit text-base-content">
                <div role="alert" className="alert alert-info">
                  <svg  fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{alertMessage}</span>
                  <button onClick={() => setAlertMessage(null)} className="btn btn-sm btn-circle btn-ghost ml-2">✕</button>
                </div>
              </div>
            )}
            <div className="bg-transparent w-[90%] flex flex-col lg:flex-row h-1/2 lg:mt-10">
                <div className="bg-transparent lg:w-1/7 w-full h-full flex lg:flex-col text-center justify-center items-center text-base-content gap-1">
                    <div className="flex lg:gap-4 sm:flex-row md:flex-row flex-col lg:flex-col gap-4 sm:gap-0">
                        <div className="flex flex-row lg:flex-col lg:gap-0 gap-20">
                            <div className="flex flex-col">
                                <div className="sm:text-2xl text-secondary text-2xl">WPM</div>
                                <div className="sm:text-5xl text-base-content text-3xl">{latest.wpm}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="sm:text-2xl text-secondary text-2xl">Accuracy</div>
                                <div className="sm:text-5xl text-base-content text-3xl">{`${accuracy}%`}</div>
                            </div>
                        </div>
                        <div className="flex lg:flex-col flex-row sm:flex-col lg:ml-0 ml-0 sm:ml-20 sm:gap-0 gap-2 w-full items-center justify-center">
                            <div className="sm:text-xl text-secondary">test type</div>
                            <div className="text-base-content">{gameMode.mode}</div>
                            <div className="text-base-content">{gameMode.words}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-transparent h-full w-full">
                    <ResultChart trackBySecond={trackBySecond}/>
                </div>
            </div>
            <div className="bg-transparent w-11/13 h-1/8 flex mt-10 justify-center items-center gap-20 md:gap-40 text-base-content">
                {/* <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#1C274C" strokeWidth="1.5"/>
                    <path d="M8 12C12.6863 12 11.3137 12 16 12M16 12L13 9M16 12L13 15" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg> */}
                <div onClick={reStartGame} className="tooltip tooltip-bottom" data-tip="Restart Game">
                    <MdOutlineRestartAlt className="w-10 h-10 md:w-12 md:h-12 fill-base-content"/>
                </div>
                
                <div onClick={screenshotAndCopy} className="tooltip tooltip-bottom" data-tip="Copy screenshot to clipboard">
                    <MdSimCardDownload className="w-10 h-10 md:w-12 md:h-12 fill-base-content"/>
                </div>

            </div>
        </>
    )
}
