import { collection, query, where, getDocs, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db, auth} from "./Firebase";
import type { GameMode } from "./gameContext";

export type ResultDoc = {
  id: string;
  wpm: number;
  raw: number;
  accuracy: number;
  time: number;
  count: number | null;
  words: string | null;
  keyCount: number;
  errors: number;
  gameMode: string;
  createdAt: Timestamp;
};

export async function getResults(): Promise<ResultDoc[]> {

    const resultsRef = collection(db, "results");
    const user = auth.currentUser;
    const userID = user?.uid;

    if(!userID) return [];

    const resultsQuery = query(resultsRef, where("userUID", "==", userID), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(resultsQuery)
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResultDoc));

    return docs;
}

// Best WPM among this user's earlier results with the same settings, or null
// if this is their first. Filtered here because Firestore would need a
// composite index to filter on all of these fields at once.
export async function getPersonalBest(userID: string, gameMode: GameMode): Promise<number | null> {
    const resultsQuery = query(collection(db, "results"), where("userUID", "==", userID));
    const querySnapshot = await getDocs(resultsQuery);
    const sameSettings = querySnapshot.docs
        .map(doc => doc.data() as ResultDoc)
        .filter(result =>
            result.gameMode === gameMode.mode &&
            result.words === gameMode.words &&
            (gameMode.mode === "Rocket Run" ? result.time === gameMode.time : result.count === gameMode.count)
        );
    if (sameSettings.length === 0) return null;
    return Math.max(...sameSettings.map(result => result.wpm));
}

export async function deleteData() {
    const userData = await getResults();
    if (!userData) return;
    await Promise.all(
        userData.map(result =>
            deleteDoc(doc(db, "results", result.id))
        )
    );
}

export async function getHighestWPM() {
    const summary = await getSummaryStats();
    if (!summary) return null;
    return summary.highestWPM;
}

export async function getAverageWPM() {
    const summary = await getSummaryStats();
    if (!summary) return null;
    return summary.averageWPM;
}

export async function getSummaryStats() {
    const results = await getResults();
    if (!results || results.length === 0) return null;
    const user = auth.currentUser;
    if (!user) {
        console.error("Not logged in")
    }
    const creationTime = user?.metadata.creationTime;

    let DaysSinceCreation = 0;
    if (creationTime) {
        const createdDate = new Date(creationTime);
        const now = new Date();
        const diffMs = now.getTime() - createdDate.getTime();
        DaysSinceCreation = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    const latest10 = results.slice(0, 10)
    const highestWPM = results.reduce((max, doc) => doc.wpm > max ? doc.wpm : max, 0);
    const averageWPM = Math.round(results.reduce((sum, doc) => sum + doc.wpm, 0) / results.length);
    const averageWPMLast10 = Math.round(latest10.reduce((sum, doc) => sum + doc.wpm, 0) / latest10.length);
    const completed = results.length;
    const timeTyping = results.reduce((sum, doc) => sum + doc.time, 0);
    const highestRAW = results.reduce((max, doc) => doc.raw > max ? doc.raw: max, 0);
    const averageRAW = Math.round(results.reduce((sum, doc) => sum + doc.raw, 0) / results.length);
    const averageRAWLast10 = Math.round(latest10.reduce((sum, doc) => sum + doc.raw, 0) / latest10.length)
    const highestAccuracy = results.reduce((max, doc) => doc.accuracy > max ? doc.accuracy : max, 0);
    const averageAccuracy = Math.round(results.reduce((sum, doc) => sum + doc.accuracy, 0) / results.length);
    const averageAccuracyLast10 = Math.round(latest10.reduce((sum, doc)=> sum + doc.accuracy, 0) / latest10.length);
    return {
        DaysSinceCreation,
        highestWPM,
        averageWPM,
        completed,
        timeTyping,
        averageAccuracyLast10,
        highestRAW,
        averageRAW,
        averageRAWLast10,
        highestAccuracy,
        averageAccuracy,
        averageWPMLast10
    };
}



