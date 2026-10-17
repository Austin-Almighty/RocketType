import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./Firebase";
import type { GameMode, TrackRecord } from "./gameContext";

export default async function resultToDB({trackBySecond, gameMode, user}: {trackBySecond: TrackRecord[], gameMode: GameMode, user: User}) {
    if (!user) return;
    const latest = trackBySecond[trackBySecond.length - 1];
    if (!latest) {
        console.error("Test result not found; nothing saved");
        return;
    }

    const averageRaw = (
        trackBySecond.reduce((sum, entry) => sum + (entry.raw ?? 0), 0) / trackBySecond.length
    ).toFixed(1);

    let accuracy = "0.0";
    if (latest.keyCount > 0) {
      const correct = latest.keyCount - latest.mistakes;
      accuracy = ((correct / latest.keyCount) * 100).toFixed(1);
    }

    try {
        await addDoc(collection(db, "results"), {
            userDisplayName: user.displayName,
            userUID: user.uid,
            gameMode: gameMode.mode,
            time: gameMode.time,
            count: gameMode.count,
            words: gameMode.words,
            keyCount: latest.keyCount,
            errors: latest.mistakes,
            wpm: latest.wpm,
            raw: Number(averageRaw),
            accuracy: Number(accuracy),
            createdAt: serverTimestamp()
        })
    } catch(e) {
        console.error("Failed to record the results", e)
    }
}
