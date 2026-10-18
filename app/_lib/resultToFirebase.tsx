import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./Firebase";
import { verifiedBackendEnabled, beginVerifiedTest, callBackend, forgetTestStart } from "./verifiedTests";
import type { CompletedResult } from "./results";

export default async function resultToDB(result: CompletedResult) {
  if (auth.currentUser?.uid !== result.userUID) {
    throw new Error("Sign in to the original account to save this result.");
  }
  if (!result.id || !Number.isFinite(result.elapsedSeconds) || result.elapsedSeconds! <= 0) {
    throw new Error("This result has no valid duration.");
  }
  if (verifiedBackendEnabled) {
    if (result.proof) {
      await beginVerifiedTest(result.proof.sessionID);
      try { return await callBackend<CompletedResult>("submitResult", { id: result.id, proof: result.proof }); }
      finally { forgetTestStart(result.proof.sessionID); }
    }
    return callBackend<CompletedResult>("importLegacyResult", result);
  }
  const { id, completedAt, ...data } = result;
  // Stable ID and completion time make a retry safe after a lost acknowledgement.
  await setDoc(doc(db, "results", id), {
    ...data,
    createdAt: Timestamp.fromMillis(completedAt),
  });
  return { ...result, verified: false };
}
