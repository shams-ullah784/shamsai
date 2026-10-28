"use client";

import { useAuth } from "./Providers";
import Orb from "./Orb";
import ThemeToggle from "./ThemeToggle";
import { AppleIcon, GoogleIcon } from "./Icons";

export default function LoginScreen() {
  const { signIn, error, continueAsGuest, firebaseReady } = useAuth();

  return (
    <main className="login">
      <div className="login-top"><ThemeToggle /></div>

      <section className="login-copy">
        <div className="brand reveal d1">
          <img src="/logo.svg" alt="" />
          ShamsAI
        </div>
        <h1 className="reveal d2">Your private AI assistant.</h1>
        <p className="lead reveal d3">Ask anything and get fast answers. Sign in once and your chats stay yours, on every device.</p>

        <div className="login-actions reveal d4">
          <button type="button" className="btn primary" onClick={() => signIn("google")}>
            <GoogleIcon /> Continue with Google
          </button>
          <button type="button" className="btn" onClick={() => signIn("apple")}>
            <AppleIcon /> Continue with Apple
          </button>
          {!firebaseReady && (
            <button type="button" className="btn" onClick={continueAsGuest}>
              Continue without sign-in (dev only)
            </button>
          )}
        </div>

        {error && <div className="notice" role="alert">{error}</div>}
        {!firebaseReady && !error && (
          <div className="notice">Sign-in is not connected yet. Add your Firebase keys to <code>.env.local</code> to turn on Google and Apple.</div>
        )}
        <p className="fineprint reveal d4">Your chats are saved to your account only. Nobody else can read them.</p>
      </section>

      <section className="login-orb" aria-hidden="true">
        <Orb interactive />
      </section>
    </main>
  );
}
