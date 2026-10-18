"use client"
import ResultChart from "./ResultChart"
import KeyHints from "./KeyHints";
import { GameMode, useGameContext } from "../_lib/gameContext";
import { useUser } from "../_lib/userContext";
import { computeConsistency } from "../_lib/typing/stats";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import html2canvas from 'html2canvas-pro';
import { MdOutlineRestartAlt } from "react-icons/md";
import { MdSimCardDownload } from "react-icons/md";
import { IoMdReturnLeft } from "react-icons/io";
import { FaCrown } from "react-icons/fa";

function testLength(gameMode: GameMode): string {
    if (gameMode.mode === "Rocket Run") return `${gameMode.time}s`;
    if (gameMode.mode === "Star Count") return `${gameMode.count} words`;
    return "";
}

function Stat({ label, title, children }: { label: string, title?: string, children: ReactNode }) {
    return (
        <div className="flex flex-col items-center" title={title}>
            <div className="text-secondary">{label}</div>
            <div className="text-xl sm:text-2xl text-base-content">{children}</div>
        </div>
    );
}

export default function Result() {
    const router = useRouter();

    const { trackBySecond, gameMode, testDetails } = useGameContext();
    const { user } = useUser();

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

    // The app page clears the old records when the new test starts. Clearing
    // them here would trigger the redirect above and drop ?autostart=1.
    function reStartGame() {
        router.push("/app?autostart=1")
    }

    function goBack() {
        router.push("/app");
    }

    // Tab or Enter starts the next test, Esc goes back to the settings.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                router.push("/app?autostart=1");
            } else if (e.key === "Escape") {
                e.preventDefault();
                router.push("/app");
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    if (trackBySecond.length === 0) {
        return null;
    }


    let accuracy = "0.0";
    const latest = trackBySecond[trackBySecond.length - 1];
    if (latest && latest.keyCount > 0) {
      const correct = latest.keyCount - latest.mistakes;
      accuracy = ((correct / latest.keyCount) * 100).toFixed(1);
    }

    const averageRaw = Math.round(
        trackBySecond.reduce((sum, entry) => sum + entry.raw, 0) / trackBySecond.length
    );
    const consistency = computeConsistency(trackBySecond);
    const characters = testDetails?.characters;
    const personalBest = testDetails?.personalBest;

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
            <div className="w-[90%] max-w-7xl flex flex-col gap-8 lg:mt-10 text-base-content animate-[test-in_300ms_ease-out]">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Headline numbers */}
                    <div className="flex lg:flex-col justify-center gap-16 lg:gap-8 lg:w-56 shrink-0 text-center lg:text-left">
                        <div className="flex flex-col">
                            <div className="text-2xl text-secondary">WPM</div>
                            <div className="text-5xl sm:text-6xl">{latest.wpm}</div>
                            {personalBest?.isNew && (
                                <div className="badge badge-primary gap-1.5 mt-2 animate-[test-in_500ms_ease-out]">
                                    <FaCrown /> New best!
                                </div>
                            )}
                            {personalBest && !personalBest.isNew && personalBest.previous !== null && (
                                <div className="text-sm text-base-content/50 mt-1">best {personalBest.previous}</div>
                            )}
                            {!user && (
                                <Link href="/user" className="text-sm text-base-content/50 hover:text-base-content underline mt-1">
                                    Log in to track your best
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="text-2xl text-secondary">Accuracy</div>
                            <div className="text-5xl sm:text-6xl">{`${accuracy}%`}</div>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <ResultChart trackBySecond={trackBySecond}/>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                    <Stat label="test type">
                        <div className="text-base sm:text-lg leading-tight">
                            {gameMode.mode}
                            <div className="text-base-content/60">{[testLength(gameMode), gameMode.words].filter(Boolean).join(" · ")}</div>
                        </div>
                    </Stat>
                    <Stat label="raw" title="Speed counting every keystroke, including mistakes">{averageRaw}</Stat>
                    <Stat
                        label="characters"
                        title="correct / incorrect / extra / missed letters at the end of the test"
                    >
                        {characters
                            ? `${characters.correct}/${characters.incorrect}/${characters.extra}/${characters.missed}`
                            : "–"}
                    </Stat>
                    <Stat label="consistency" title="How steady your speed was from second to second">{`${consistency}%`}</Stat>
                    <Stat label="time">{`${latest.elapsedSeconds}s`}</Stat>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex justify-center items-center gap-16 md:gap-28">
                        <div className="tooltip tooltip-bottom" data-tip="Next test (Tab)">
                            <button type="button" aria-label="Next test" onClick={reStartGame} className="btn btn-ghost btn-circle btn-lg">
                                <MdOutlineRestartAlt className="w-10 h-10 fill-base-content"/>
                            </button>
                        </div>
                        <div className="tooltip tooltip-bottom" data-tip="Back to settings (Esc)">
                            <button type="button" aria-label="Back to settings" onClick={goBack} className="btn btn-ghost btn-circle btn-lg">
                                <IoMdReturnLeft className="w-9 h-9 fill-base-content"/>
                            </button>
                        </div>
                        <div className="tooltip tooltip-left" data-tip="Copy screenshot to clipboard">
                            <button type="button" aria-label="Copy screenshot to clipboard" onClick={screenshotAndCopy} className="btn btn-ghost btn-circle btn-lg">
                                <MdSimCardDownload className="w-10 h-10 fill-base-content"/>
                            </button>
                        </div>
                    </div>
                    <KeyHints hints={[{ keys: ["tab", "enter"], action: "next test" }, { keys: ["esc"], action: "settings" }]} />
                </div>
            </div>
        </>
    )
}
