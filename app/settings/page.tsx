"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { updateProfile, updatePassword, deleteUser } from "firebase/auth";
import { auth } from "../_lib/Firebase";
import { useUser } from "../_lib/userContext";
import { useGameContext } from "../_lib/gameContext";
import { verifiedBackendEnabled } from "../_lib/verifiedTests";
import { deleteData } from "../_lib/getResults";

type Action = "name" | "password" | "reset" | "delete";
const TITLES: Record<Action, string> = {
  name: "Update display name", password: "Change password", reset: "Reset test data", delete: verifiedBackendEnabled ? "Delete account and data" : "Delete sign-in account",
};

function accountError(error: unknown): string {
  console.error("Account update failed", error instanceof FirebaseError ? error.code : error instanceof Error ? error.message : "Unknown error");
  if (error instanceof FirebaseError) {
    if (error.code === "auth/requires-recent-login") return "For your security, sign out and sign in again, then retry this change.";
    if (error.code === "auth/weak-password") return "Choose a stronger password with at least 8 characters.";
    if (error.code === "auth/network-request-failed") return "Check your connection, then try again. Your input has been kept.";
    if (error.code === "auth/too-many-requests") return "Too many attempts. Wait a moment, then try again.";
    return "Couldn’t complete this change. Check your connection and try again.";
  }
  return error instanceof Error ? error.message : "Couldn’t complete this change. Try again.";
}

export default function Settings() {
  const { user, loading } = useUser();
  const { resetResults, resettingResults } = useGameContext();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/user");
  }, [loading, user, router]);

  useEffect(() => {
    // Open after the form renders so native dialog focus reaches the first field.
    if (action) dialogRef.current?.showModal();
  }, [action]);

  function open(next: Action) {
    setAction(next);
    setError(null);
    setNotice(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!action || busy) return;
    const currentAction = action;
    setError(null);
    if (action === "name" && (!name.trim() || name.trim().length > 50)) {
      setError("Enter a display name between 1 and 50 characters.");
      return;
    }
    if (action === "password" && password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    function currentUser() {
      if (!user || auth.currentUser?.uid !== user.uid) throw new Error("Sign in to the original account, then retry this change.");
      return auth.currentUser;
    }
    setBusy(true);
    try {
      if (currentAction === "name") {
        await updateProfile(currentUser(), { displayName: name.trim() });
        setName("");
        setNotice("Display name updated.");
      } else if (currentAction === "password") {
        await updatePassword(currentUser(), password);
        setPassword("");
        setNotice("Password updated.");
      } else if (currentAction === "reset") {
        await resetResults(async () => { currentUser(); await deleteData(); });
        setNotice("Test data and pending saves cleared.");
      } else {
        await resetResults(async () => { await deleteUser(currentUser()); });
        router.replace("/user");
      }
      dialogRef.current?.close();
      setAction(null);
    } catch (error) {
      setError(accountError(error));
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return <p role="status" className="p-10 text-center text-base-content">Checking your account…</p>;
  const pending = busy || resettingResults;
  return (
    <div className="w-[92%] max-w-3xl mx-auto my-6 space-y-5 text-base-content">
      <h1 className="text-3xl">Account settings</h1>
      {notice && <p role="status" className="alert alert-success">{notice}</p>}
      {!action && error && <p role="alert" className="alert alert-error">{error}</p>}
      <section className="bg-base-200 rounded-2xl p-5 space-y-3">
        <h2 className="text-xl">Your profile</h2>
        <p className="break-words">{user.displayName || "No display name set"}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => open("name")}>Update name</button>
          <button type="button" className="btn" disabled={pending} onClick={() => open("password")}>Change password</button>
        </div>
      </section>
      <section className="bg-base-200 rounded-2xl p-5 space-y-3">
        <h2 className="text-xl">Reset test data</h2>
        <p>Delete your saved test results, leaderboard entries, and pending saves on this device. This cannot be undone.</p>
        <button type="button" className="btn btn-warning" disabled={pending} onClick={() => open("reset")}>Reset test data</button>
      </section>
      <section className="bg-base-200 rounded-2xl p-5 space-y-3">
        <h2 className="text-xl">{TITLES.delete}</h2>
        <p>{verifiedBackendEnabled ? "Delete your account permanently. Server cleanup will remove its saved results and test sessions, even if you close this browser." : "Delete your sign-in account permanently. Stored test results are managed separately: reset your test data first if you want to remove it."}</p>
        <button type="button" className="btn btn-error" disabled={pending} onClick={() => open("delete")}>{TITLES.delete}</button>
      </section>
      <dialog ref={dialogRef} aria-labelledby="account-action-title" className="modal" onClose={() => { setAction(null); if (!busy) setPassword(""); }}>
        <div className="modal-box bg-base-100 text-base-content w-11/12 max-w-lg rounded-2xl">
          <h2 id="account-action-title" className="text-xl mb-4">{action ? TITLES[action] : "Account change"}</h2>
          <form onSubmit={submit} aria-busy={busy} className="space-y-4">
            {action === "name" && <div>
              <label htmlFor="display-name" className="block mb-2">Display name</label>
              <input id="display-name" name="displayName" type="text" autoComplete="nickname" spellCheck={false} required maxLength={50}
                className="input w-full" value={name} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={error ? "account-action-error" : undefined}
                onChange={(event) => setName(event.target.value)} />
            </div>}
            {action === "password" && <div>
              <label htmlFor="new-password" className="block mb-2">New password</label>
              <input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8}
                className="input w-full" value={password} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={error ? "account-action-error" : undefined}
                onChange={(event) => setPassword(event.target.value)} />
            </div>}
            {action === "reset" && <p>Remove all your saved test results and pending saves? This cannot be undone.</p>}
            {action === "delete" && <p>{verifiedBackendEnabled ? "Delete your account and queue permanent removal of its saved tests? This cannot be undone." : "Delete your sign-in account? This cannot be undone. Reset test data first if you also want to remove stored scores."}</p>}
            {error && <p id="account-action-error" role="alert" className="text-error">{error}</p>}
            {busy && <p role="status">Working… This action will continue if you close the dialog. Keep this tab open.</p>}
            <div className="flex flex-wrap gap-3 justify-end">
              <button type="button" className="btn" onClick={() => dialogRef.current?.close()}>{busy ? "Close" : "Cancel"}</button>
              <button type="submit" disabled={busy} className={action === "delete" ? "btn btn-error" : action === "reset" ? "btn btn-warning" : "btn btn-primary"}>
                {busy ? "Working…" : action === "reset" ? "Delete test data" : action === "delete" ? TITLES.delete : "Save change"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
