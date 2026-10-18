"use client";
import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { auth } from "../../_lib/Firebase";

function authMessage(error: unknown): string {
  console.error("Authentication failed", error instanceof FirebaseError ? error.code : "Unknown error");
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential": case "auth/wrong-password": case "auth/user-not-found":
        return "The email or password wasn’t accepted. Check your details and try again.";
      case "auth/email-already-in-use": return "This email already has an account. Try signing in.";
      case "auth/popup-closed-by-user": return "The sign-in window was closed. Try again when you’re ready.";
      case "auth/popup-blocked": return "Allow the sign-in popup in your browser, then try again.";
      case "auth/unauthorized-domain": return "Sign-in isn’t available at this address. Open the main RocketType website and try again.";
      case "auth/network-request-failed": return "Check your connection, then try again.";
      case "auth/too-many-requests": return "Too many attempts. Wait a moment before trying again.";
      case "auth/account-exists-with-different-credential": return "Use the sign-in method you originally used for this email.";
    }
  }
  return "Couldn’t sign in. Check your details or try another sign-in method.";
}

type LoginFields = { email: string; password: string };
type RegisterFields = LoginFields & { verifyEmail: string; verifyPassword: string };

export default function LoginRegister() {
  const login = useForm<LoginFields>();
  const registration = useForm<RegisterFields>();
  const [message, setMessage] = useState<string | null>(null);
  const [popupBusy, setPopupBusy] = useState(false);
  const busy = popupBusy || login.formState.isSubmitting || registration.formState.isSubmitting;

  async function socialSignIn(provider: GoogleAuthProvider | GithubAuthProvider) {
    setMessage(null);
    setPopupBusy(true);
    try { await signInWithPopup(auth, provider); }
    catch (error) { setMessage(authMessage(error)); }
    finally { setPopupBusy(false); }
  }

  return (
    <section className="w-[92vw] max-w-3xl mx-auto mb-10 text-base-content">
      <h1 className="text-3xl mb-3">Track your typing journey</h1>
      <p className="text-base-content/70 mb-6">Sign in to save results and follow your progress.</p>
      {message && <p role="alert" className="alert alert-error mb-5">{message}</p>}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="bg-base-200 rounded-2xl p-5">
          <h2 className="text-xl mb-4">Sign in</h2>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => void socialSignIn(new GoogleAuthProvider())}
            >
              <FaGoogle aria-hidden />Continue with Google</button>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => void socialSignIn(new GithubAuthProvider())}
            >
              <FaGithub aria-hidden />Continue with GitHub</button>
          </div>
          <div className="divider">or use email</div>
          <form
            className="space-y-3"
            onSubmit={login.handleSubmit(async ({ email, password }) => {
              setMessage(null);
              try { await signInWithEmailAndPassword(auth, email, password); }
              catch (error) { setMessage(authMessage(error)); }
            })}
          >
            <div>
              <label
                htmlFor="login-email"
                className="block mb-1"
              >Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                spellCheck={false}
                className="input w-full"
                aria-invalid={Boolean(login.formState.errors.email)}
                aria-describedby={login.formState.errors.email ? "login-email-error" : undefined}
                {...login.register("email", { required: "Enter your email address." })}
              />{login.formState.errors.email && <p
                id="login-email-error"
                role="alert"
              >{login.formState.errors.email.message}</p>}
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block mb-1"
              >Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                className="input w-full"
                aria-invalid={Boolean(login.formState.errors.password)}
                aria-describedby={login.formState.errors.password ? "login-password-error" : undefined}
                {...login.register("password", { required: "Enter your password." })}
              />{login.formState.errors.password && <p
                id="login-password-error"
                role="alert"
              >{login.formState.errors.password.message}</p>}
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={busy}
            >{login.formState.isSubmitting ? "Signing in…" : "Sign in"}</button>
          </form>
        </div>
        <form
          className="bg-base-200 rounded-2xl p-5 space-y-3"
          onSubmit={registration.handleSubmit(async ({ email, password }) => {
            setMessage(null);
            try { await createUserWithEmailAndPassword(auth, email, password); }
            catch (error) { setMessage(authMessage(error)); }
          })}
        >
          <h2 className="text-xl mb-4">Create an account</h2>
          <div>
            <label
              htmlFor="register-email"
              className="block mb-1"
            >Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              className="input w-full"
              aria-invalid={Boolean(registration.formState.errors.email)}
              {...registration.register("email", { required: "Enter your email address." })}
            />{registration.formState.errors.email && <p role="alert">{registration.formState.errors.email.message}</p>}
          </div>
          <div>
            <label
              htmlFor="verify-email"
              className="block mb-1"
            >Confirm email</label>
            <input
              id="verify-email"
              type="email"
              autoComplete="off"
              spellCheck={false}
              className="input w-full"
              aria-invalid={Boolean(registration.formState.errors.verifyEmail)}
              {...registration.register("verifyEmail", { required: "Confirm your email address.", validate: (value) => value === registration.getValues("email") || "Email addresses must match." })}
            />{registration.formState.errors.verifyEmail && <p role="alert">{registration.formState.errors.verifyEmail.message}</p>}
          </div>
          <div>
            <label
              htmlFor="register-password"
              className="block mb-1"
            >Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              className="input w-full"
              aria-invalid={Boolean(registration.formState.errors.password)}
              {...registration.register("password", { required: "Enter a password.", minLength: { value: 8, message: "Use at least 8 characters." } })}
            />{registration.formState.errors.password && <p role="alert">{registration.formState.errors.password.message}</p>}
          </div>
          <div>
            <label
              htmlFor="verify-password"
              className="block mb-1"
            >Confirm password</label>
            <input
              id="verify-password"
              type="password"
              autoComplete="new-password"
              className="input w-full"
              aria-invalid={Boolean(registration.formState.errors.verifyPassword)}
              {...registration.register("verifyPassword", { required: "Confirm your password.", validate: (value) => value === registration.getValues("password") || "Passwords must match." })}
            />{registration.formState.errors.verifyPassword && <p role="alert">{registration.formState.errors.verifyPassword.message}</p>}
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={busy}
          >{registration.formState.isSubmitting ? "Creating account…" : "Create account"}</button>
        </form>
      </div>
    </section>
  );
}
