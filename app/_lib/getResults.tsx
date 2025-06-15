import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth} from "./Firebase";

export async function getResults() {

    const resultsRef = collection(db, "results");
    const user = auth.currentUser;
    const userID = user?.uid;

    if(!userID) return null;

    const resultsQuery = query(resultsRef, where("userUID", "==", userID), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(resultsQuery)
    const docs = querySnapshot.docs.map(doc=>doc.data());

    return docs;
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
