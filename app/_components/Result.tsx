"use client"
import ResultChart from "./ResultChart"
import { useGameContext } from "../_lib/gameContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import html2canvas from 'html2canvas-pro';


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
              <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-fit">
                <div role="alert" className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{alertMessage}</span>
                  <button onClick={() => setAlertMessage(null)} className="btn btn-sm btn-circle btn-ghost ml-2">✕</button>
                </div>
              </div>
            )}
            <div className="bg-transparent w-11/13 flex h-1/2 relative top-20">
                <div className="bg-transparent w-1/7 h-full flex flex-col text-center justify-center items-center text-blue-950 gap-1">
                    <div className="text-2xl">WPM</div>
                    <div className="text-5xl">{latest.wpm}</div>
                    <div className="text-2xl">Accuracy</div>
                    <div className="text-5xl">{`${accuracy}%`}</div>
                    <div className="text-xl">test type</div>
                    <div>{gameMode.mode}</div>
                    <div>{gameMode.words}</div>
                    
                </div>
                <div className="bg-transparent h-full w-full">
                    <ResultChart trackBySecond={trackBySecond}/>
                </div>
            </div>
            <div className="bg-transparent w-11/13 h-1/8 flex relative top-20 justify-center items-center gap-20">
                {/* <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#1C274C" strokeWidth="1.5"/>
                    <path d="M8 12C12.6863 12 11.3137 12 16 12M16 12L13 9M16 12L13 15" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg> */}
                <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={reStartGame}>
                    <circle cx="12" cy="12" r="10" stroke="#1C274C" strokeWidth="1.5"/>
                    <path d="M15.9775 8.71452L15.5355 8.2621C13.5829 6.26318 10.4171 6.26318 8.46447 8.2621C6.51184 10.261 6.51184 13.5019 8.46447 15.5008C10.4171 17.4997 13.5829 17.4997 15.5355 15.5008C16.671 14.3384 17.1462 12.7559 16.9611 11.242M15.9775 8.71452H13.3258M15.9775 8.71452V6" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div onClick={screenshotAndCopy}>
                    <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.3929 4.05365L14.8912 4.61112L15.3929 4.05365ZM19.3517 7.61654L18.85 8.17402L19.3517 7.61654ZM21.654 10.1541L20.9689 10.4592V10.4592L21.654 10.1541ZM3.17157 20.8284L3.7019 20.2981H3.7019L3.17157 20.8284ZM20.8284 20.8284L20.2981 20.2981L20.2981 20.2981L20.8284 20.8284ZM14 21.25H10V22.75H14V21.25ZM2.75 14V10H1.25V14H2.75ZM21.25 13.5629V14H22.75V13.5629H21.25ZM14.8912 4.61112L18.85 8.17402L19.8534 7.05907L15.8947 3.49618L14.8912 4.61112ZM22.75 13.5629C22.75 11.8745 22.7651 10.8055 22.3391 9.84897L20.9689 10.4592C21.2349 11.0565 21.25 11.742 21.25 13.5629H22.75ZM18.85 8.17402C20.2034 9.3921 20.7029 9.86199 20.9689 10.4592L22.3391 9.84897C21.9131 8.89241 21.1084 8.18853 19.8534 7.05907L18.85 8.17402ZM10.0298 2.75C11.6116 2.75 12.2085 2.76158 12.7405 2.96573L13.2779 1.5653C12.4261 1.23842 11.498 1.25 10.0298 1.25V2.75ZM15.8947 3.49618C14.8087 2.51878 14.1297 1.89214 13.2779 1.5653L12.7405 2.96573C13.2727 3.16993 13.7215 3.55836 14.8912 4.61112L15.8947 3.49618ZM10 21.25C8.09318 21.25 6.73851 21.2484 5.71085 21.1102C4.70476 20.975 4.12511 20.7213 3.7019 20.2981L2.64124 21.3588C3.38961 22.1071 4.33855 22.4392 5.51098 22.5969C6.66182 22.7516 8.13558 22.75 10 22.75V21.25ZM1.25 14C1.25 15.8644 1.24841 17.3382 1.40313 18.489C1.56076 19.6614 1.89288 20.6104 2.64124 21.3588L3.7019 20.2981C3.27869 19.8749 3.02502 19.2952 2.88976 18.2892C2.75159 17.2615 2.75 15.9068 2.75 14H1.25ZM14 22.75C15.8644 22.75 17.3382 22.7516 18.489 22.5969C19.6614 22.4392 20.6104 22.1071 21.3588 21.3588L20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25V22.75ZM21.25 14C21.25 15.9068 21.2484 17.2615 21.1102 18.2892C20.975 19.2952 20.7213 19.8749 20.2981 20.2981L21.3588 21.3588C22.1071 20.6104 22.4392 19.6614 22.5969 18.489C22.7516 17.3382 22.75 15.8644 22.75 14H21.25ZM2.75 10C2.75 8.09318 2.75159 6.73851 2.88976 5.71085C3.02502 4.70476 3.27869 4.12511 3.7019 3.7019L2.64124 2.64124C1.89288 3.38961 1.56076 4.33855 1.40313 5.51098C1.24841 6.66182 1.25 8.13558 1.25 10H2.75ZM10.0298 1.25C8.15538 1.25 6.67442 1.24842 5.51887 1.40307C4.34232 1.56054 3.39019 1.8923 2.64124 2.64124L3.7019 3.7019C4.12453 3.27928 4.70596 3.02525 5.71785 2.88982C6.75075 2.75158 8.11311 2.75 10.0298 2.75V1.25Z" fill="#1C274C"/>
                        <path d="M13 2.5V5C13 7.35702 13 8.53553 13.7322 9.26777C14.4645 10 15.643 10 18 10H22" stroke="#1C274C" strokeWidth="1.5"/>
                        <path d="M8.5 13.5L8.5 18.5M8.5 18.5L10.5 16.625M8.5 18.5L6.5 16.625" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

            </div>
        </>
    )
}
