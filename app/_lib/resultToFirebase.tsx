import { collection, addDoc } from "firebase/firestore";



import { db} from "./Firebase";
import { User } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";


type GameMode = {
    start: boolean,
    mode: "Rocket Run" | "Star Count" | "Zen" | null,
    time: number | null,
    count: number | null,
    words: "1k" | "5k" | "10k" | null
};

type TrackRecord = {
  keyCount: number;
  wpm: number;
  raw: number;
  mistakes: number;
  elapsedSeconds: number;
};




export default async function resultToDB({trackBySecond, gameMode, user}: {trackBySecond: TrackRecord[], gameMode: GameMode, user: User}) {
    if (!user) return;
    if (trackBySecond.length === 0) console.error("Test Result not Found")
    const averageRaw =
  trackBySecond.length > 0
    ? (
        trackBySecond.reduce((sum, entry) => sum + (entry.raw ?? 0), 0) /
        trackBySecond.length
      ).toFixed(1)
    : "0.0";
    
    let accuracy = "0.0";
    const latest = trackBySecond[trackBySecond.length - 1];
    if (latest && latest.keyCount > 0) {
      const correct = latest.keyCount - latest.mistakes;
      accuracy = ((correct / latest.keyCount) * 100).toFixed(1); 
    }

    try {
        const docRef = await addDoc(collection(db, "results"), {
            userDisplayName: user?.displayName,
            userUID: user?.uid,
            gameMode: gameMode.mode,
            time: gameMode.time,
            count: gameMode.count,
            words: gameMode.words,
            keyCount: latest.keyCount,
            errors: latest.mistakes,
            wpm: latest.wpm,
            raw:Number(averageRaw),
            accuracy: Number(accuracy),
            createdAt: serverTimestamp()
        })
    } catch(e) {
        console.error("Failed to record the results", e)
    }
}