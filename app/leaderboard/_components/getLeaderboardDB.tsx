import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/app/_lib/Firebase";

export async function getLeaderboardResults(range: string, time: string) {
    const resultsRef = collection(db, "results");
    let resultsQuery;

    if (range === "All-time") {
        resultsQuery = query(
            resultsRef,
            where("time", "==", Number(time)),
            where("gameMode", "==", "Rocket Run"),
            orderBy("wpm", "desc")
        );
    } else if (range === "Monthly") {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        resultsQuery = query(
            resultsRef,
            where("time", "==", Number(time)),
            where("gameMode", "==", "Rocket Run"),
            where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
            where("createdAt", "<", Timestamp.fromDate(startOfNextMonth)),
            orderBy("wpm", "desc")
        );
    } else if (range === "Daily") {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfNextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        resultsQuery = query(
            resultsRef,
            where("time", "==", Number(time)),
            where("gameMode", "==", "Rocket Run"),
            where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
            where("createdAt", "<", Timestamp.fromDate(startOfNextDay)),
            orderBy("wpm", "desc")
        );
    }
    if (!resultsQuery) throw new Error("Failed to retrieve leaderboard results")
    const querySnapshot = await getDocs(resultsQuery)
    const docs = querySnapshot.docs.map(doc=>doc.data());

    return docs;
}

