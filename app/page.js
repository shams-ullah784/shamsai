"use client";

import { useAuth } from "../components/Providers";
import LoginScreen from "../components/LoginScreen";
import ChatApp from "../components/ChatApp";
import Orb from "../components/Orb";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <Orb size="sm" busy />
      </main>
    );
  }
  // key={uid} guarantees one person's chats are never shown to the next person on the same device
  return user ? <ChatApp key={user.uid} /> : <LoginScreen />;
}
