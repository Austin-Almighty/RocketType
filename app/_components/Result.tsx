"use client"
import ResultChart from "./ResultChart"
import KeyHints from "./KeyHints";
import { GameMode, useGameContext } from "../_lib/gameContext";
import { useUser } from "../_lib/userContext";
import { computeConsistency, computeRaw } from "../_lib/typing/stats";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
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
            <div className="text-base-content/70">{label}</div>
            <div className="text-xl sm:text-2xl text-base-content">{children}</div>
        </div>
    );
}

export default function Result() {
    const router = useRouter();

    const { trackBySecond, gameMode: currentSettings, testDetails, setPracticeWords, savedResults } = useGameContext();
    const gameMode = testDetails?.settings ?? currentSettings;
    const isPractice = testDetails?.testKind === "practice";
    const saveStatus = savedResults.find((entry) => entry.result.id === testDetails?.resultID)?.status;
    const { user } = useUser();

    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    async function screenshotAndCopy() {
        let canvas: HTMLCanvasElement;
        try {
            const { default: html2canvas } = await import("html2canvas-pro");
            canvas = await html2canvas(document.body);
        } catch (error) {
            console.error("Could not capture result", error);
            setAlertMessage("Couldn’t capture the result. Try again.");
            return;
        }

        canvas.toBlob(async (blob) => {
            if (blob) {
                try {
                    await navigator.clipboard.write([
                        new window.ClipboardItem({"image/png": blob})
                    ]);
                    setAlertMessage("screenshot copied to clipboard!")
                } catch (e) {
                    console.error("Could not copy result", e);
                    setAlertMessage("Couldn’t copy the image. Check clipboard permissions and try again.");
                }
            } else {
                setAlertMessage("Couldn’t create the image. Try again.");
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
        router.push(isPractice ? "/app?autostart=1&practice=1" : "/app?autostart=1")
    }

    function goBack() {
        setPracticeWords(null);
        router.push("/app");
    }

    if (trackBySecond.length === 0) {
        return null;
    }


    let accuracy = "0.0";
    const latest = trackBySecond[trackBySecond.length - 1];
    if (latest && latest.keyCount > 0) {
      const correct = latest.keyCount - latest.mistakes;
      accuracy = ((correct / latest.keyCount) * 100).toFixed(1);
    }

    const averageRaw = computeRaw(latest.keyCount, latest.elapsedSeconds);
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
            <div className="w-[92%] max-w-7xl flex flex-col gap-8 mt-6 mb-8 text-base-content animate-[test-in_300ms_ease-out]">
                <div className="flex flex-col lg:flex-row gap-6">
                    {isPractice && <span className="badge badge-outline self-start">Practice · Unranked</span>}
                    {/* Headline numbers */}
                    <div className="flex lg:flex-col justify-center gap-8 sm:gap-16 lg:gap-8 lg:w-56 shrink-0 text-center lg:text-left">
                        <div className="flex flex-col">
                            <div className="text-xl text-base-content/70" title="Correct letters retained, plus separators after correct words, divided by five and elapsed minutes">WPM</div>
                            <div className="text-4xl sm:text-6xl">{latest.wpm}</div>
                            {personalBest?.isNew && (
                                <div className="badge badge-primary gap-1.5 mt-2 animate-[test-in_500ms_ease-out]">
                                    <FaCrown /> New best!
                                </div>
                            )}
                            {personalBest && !personalBest.isNew && personalBest.previous !== null && (
                                <div className="text-sm text-base-content/70 mt-1">best {personalBest.previous}</div>
                            )}
                            {!user && (
                                <Link href="/user" className="text-sm text-base-content/70 hover:text-base-content underline mt-1">
                                    Log in to track your best
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="text-2xl text-base-content/70">Accuracy</div>
                            <div className="text-4xl sm:text-6xl">{`${accuracy}%`}</div>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <ResultChart trackBySecond={trackBySecond} completedAt={testDetails?.completedAt}/>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                    <Stat label="test type">
                        <div className="text-base sm:text-lg leading-tight">
                            {isPractice ? "Missed-word practice" : gameMode.mode}
                            <div className="text-base-content/70">{isPractice ? "Unranked" : [testLength(gameMode), gameMode.words].filter(Boolean).join(" · ")}</div>
                        </div>
                    </Stat>
                    <Stat label="raw" title="Speed counting every keystroke, including mistakes">{averageRaw}</Stat>
                    <Stat label="characters">
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-left">
                          {(["correct", "incorrect", "extra", "missed"] as const).map((label) => (
                            <div key={label}><dt className="text-base-content/70">{label}</dt><dd className="tabular-nums">{characters?.[label] ?? "–"}</dd></div>
                          ))}
                        </dl>
                    </Stat>
                    <Stat label="consistency" title="How steady your speed was from second to second">{`${consistency}%`}</Stat>
                    <Stat label="time">{latest.elapsedSeconds < 0.1 ? "<0.1s" : `${latest.elapsedSeconds.toFixed(1)}s`}</Stat>
                </div>

                <div className="flex flex-col gap-4">
                    <p role="status" className="text-sm text-center text-base-content/70">
                      {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved to your history" : saveStatus === "error" ? "Couldn’t save. Use Retry saving below." : "This result is available for this session."}
                    </p>
                    {testDetails && testDetails.missedWords.length > 0 && (
                      <button type="button" className="btn btn-primary self-center" onClick={() => {
                        setPracticeWords(testDetails.missedWords);
                        router.push("/app?autostart=1&practice=1");
                      }}>Practice {testDetails.missedWords.length} missed {testDetails.missedWords.length === 1 ? "word" : "words"}</button>
                    )}
                    <div className="flex justify-center items-center gap-4 sm:gap-12">
                        <div className="tooltip tooltip-bottom" data-tip="Next test">
                            <button type="button" aria-label="Next test" onClick={reStartGame} className="btn btn-ghost h-auto py-3 flex-col">
                                <MdOutlineRestartAlt aria-hidden className="w-7 h-7 fill-base-content"/><span>Next test</span>
                            </button>
                        </div>
                        <div className="tooltip tooltip-bottom" data-tip="Back to settings">
                            <button type="button" aria-label="Back to settings" onClick={goBack} className="btn btn-ghost h-auto py-3 flex-col">
                                <IoMdReturnLeft aria-hidden className="w-7 h-7 fill-base-content"/><span>Settings</span>
                            </button>
                        </div>
                        <div className="tooltip tooltip-left" data-tip="Copy screenshot to clipboard">
                            <button type="button" aria-label="Copy screenshot to clipboard" onClick={screenshotAndCopy} className="btn btn-ghost h-auto py-3 flex-col">
                                <MdSimCardDownload aria-hidden className="w-7 h-7 fill-base-content"/><span>Copy result</span>
                            </button>
                        </div>
                    </div>
                    <KeyHints hints={[{ keys: ["tab"], action: "move between actions" }, { keys: ["enter"], action: "activate selected action" }]} />
                </div>
            </div>
        </>
    )
}
