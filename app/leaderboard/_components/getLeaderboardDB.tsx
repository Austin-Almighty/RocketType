import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/app/_lib/Firebase";
import { rankResults, rankingPeriod, type LeaderboardRange, type ResultDoc } from "@/app/_lib/results";
import { verifiedBackendEnabled } from "@/app/_lib/verifiedTests";
import { SCORING_VERSION } from "@/app/_lib/typing/stats";
import type { WordSet } from "@/app/_lib/typing/words";

export async function getLeaderboardResults(range: LeaderboardRange, time: number, words: WordSet) {
  const now = new Date();
  const [start, end] = rankingPeriod(range, now);
  const constraints = [
    where("gameMode", "==", "Rocket Run"), where("time", "==", time),
    where("words", "==", words), where("scoringVersion", "==", SCORING_VERSION),
    where("testKind", "==", "standard"),
  ];
  if (verifiedBackendEnabled) constraints.push(where("verified", "==", true));
  if (range !== "All-time") constraints.push(
    where("createdAt", ">=", Timestamp.fromMillis(start)),
    where("createdAt", "<", Timestamp.fromMillis(end)),
  );
  const snapshot = await getDocs(query(collection(db, "results"), ...constraints, orderBy("createdAt", "asc")));
  const results = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as ResultDoc));
  // shortcut: deduplicate qualifying attempts in memory; aggregate per-user bests when leaderboard reads become costly.
  return rankResults(results, { start: false, mode: "Rocket Run", time, count: null, words }, range, now);
}
