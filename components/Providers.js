"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, firebaseReady } from "../lib/firebase";

const ThemeCtx = createContext(null);
const AuthCtx = createContext(null);

export const useTheme = () => useContext(ThemeCtx);
export const useAuth = () => useContext(AuthCtx);

const GUEST = { uid: "guest", displayName: "Guest", email: "Dev mode - saved on this device only", photoURL: null, guest: true };

export default function Providers({ children }) {
  /* ---- theme ---- */
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "dark");
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("shamsai-theme", next); } catch {}
      return next;
    });
  }, []);

  /* ---- auth ---- */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (kind) => {
    setError("");
    if (!firebaseReady) {
      setError("Firebase is not set up yet. Add your keys to .env.local (see the setup guide).");
      return;
    }
    try {
      const provider = kind === "apple" ? new OAuthProvider("apple.com") : new GoogleAuthProvider();
      if (kind === "apple") { provider.addScope("email"); provider.addScope("name"); }
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") return;
      if (e?.code === "auth/operation-not-allowed") {
        setError(`${kind === "apple" ? "Apple" : "Google"} sign-in is not turned on in your Firebase project yet.`);
      } else if (e?.code === "auth/unauthorized-domain") {
        setError("This website address is not allowed yet. Add it under Firebase > Authentication > Settings > Authorized domains.");
      } else {
        setError("Sign-in failed. Please try again.");
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    if (user?.guest) { setUser(null); return; }
    await fbSignOut(auth);
  }, [user]);

  const continueAsGuest = useCallback(() => setUser(GUEST), []);

  const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  const authValue = useMemo(
    () => ({ user, loading, error, signIn, signOut, continueAsGuest, firebaseReady }),
    [user, loading, error, signIn, signOut, continueAsGuest]
  );

  return (
    <ThemeCtx.Provider value={themeValue}>
      <AuthCtx.Provider value={authValue}>{children}</AuthCtx.Provider>
    </ThemeCtx.Provider>
  );
}
