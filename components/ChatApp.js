"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { auth } from "../lib/firebase";
import { loadChats, removeChat, saveChat } from "../lib/chats";
import { useAuth } from "./Providers";
import Orb from "./Orb";
import ThemeToggle from "./ThemeToggle";
import { LogoutIcon, MenuIcon, PlusIcon, SendIcon, StopIcon, TrashIcon } from "./Icons";

const SUGGESTIONS = [
  "Explain something to me simply",
  "Help me write a polite message",
  "Plan my day in 5 steps",
  "Find the bug in my code",
];

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

export default function ChatApp() {
  const { user, signOut } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const abortRef = useRef(null);
  const endRef = useRef(null);
  const taRef = useRef(null);

  const active = chats.find((c) => c.id === activeId) || null;
  const messages = active?.messages || [];

  /* load this user's chats (and only theirs) */
  useEffect(() => {
    let alive = true;
    loadChats(user)
      .then((list) => alive && setChats(list))
      .catch(() => alive && setNotice("Could not load your saved chats."));
    return () => { alive = false; };
  }, [user]);

  /* keep the newest text in view */
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  /* auto-growing textarea */
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const persist = useCallback(
    (chat) => saveChat(user, chat).catch(() => setNotice("Could not save this chat. Check your connection.")),
    [user]
  );

  const newChat = () => {
    abortRef.current?.abort();
    setActiveId(null);
    setInput("");
    setMenuOpen(false);
    taRef.current?.focus();
  };

  const openChat = (id) => {
    abortRef.current?.abort();
    setActiveId(id);
    setMenuOpen(false);
  };

  const deleteChat = async (id) => {
    setChats((list) => list.filter((c) => c.id !== id));
    if (id === activeId) setActiveId(null);
    try { await removeChat(user, id); } catch { setNotice("Could not delete that chat."); }
  };

  const stop = () => abortRef.current?.abort();

  const send = async (raw) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setNotice("");
    setInput("");

    const id = active?.id || newId();
    const history = [...messages, { role: "user", content: text }];
    const base = { id, title: active?.title || text.slice(0, 42), messages: history, updatedAt: Date.now() };

    const put = (messagesNow) =>
      setChats((list) => {
        const chat = { ...base, messages: messagesNow, updatedAt: Date.now() };
        return [chat, ...list.filter((c) => c.id !== id)];
      });

    put([...history, { role: "assistant", content: "" }]);
    setActiveId(id);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "";

    try {
      const headers = { "Content-Type": "application/json" };
      if (auth?.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let msg = "Something went wrong. Please try again.";
        try { msg = (await res.json()).error || msg; } catch {}
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        put([...history, { role: "assistant", content: acc }]);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        acc = acc || err.message || "Something went wrong. Please try again.";
        setNotice(err.message || "Something went wrong.");
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
      const finalMessages = acc ? [...history, { role: "assistant", content: acc }] : history;
      put(finalMessages);
      persist({ ...base, messages: finalMessages, updatedAt: Date.now() });
      taRef.current?.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const first = (user.displayName || "there").split(" ")[0];
  const initial = (user.displayName || user.email || "?").trim()[0]?.toUpperCase();
  const lastIsEmptyAi = busy && messages.length && messages[messages.length - 1].content === "";

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`} aria-label="Chats">
        <div className="side-head">
          <div className="brand"><img src="/logo.svg" alt="" width="30" height="30" style={{ width: 30, height: 30 }} />ShamsAI</div>
        </div>

        <button type="button" className="new-chat" onClick={newChat}><PlusIcon /> New chat</button>

        <nav className="chat-list">
          {chats.length === 0 && <div className="empty-list">Your chats will show up here.</div>}
          {chats.map((c) => (
            <div key={c.id} className={`chat-item ${c.id === activeId ? "active" : ""}`}>
              <button type="button" className="open" onClick={() => openChat(c.id)} title={c.title}>{c.title}</button>
              <button type="button" className="del" onClick={() => deleteChat(c.id)} aria-label={`Delete chat: ${c.title}`}><TrashIcon /></button>
            </div>
          ))}
        </nav>

        <div className="user-card">
          {user.photoURL ? <img className="avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <div className="avatar">{initial}</div>}
          <div className="user-meta">
            <div className="user-name">{user.displayName || "Signed in"}</div>
            <div className="user-mail">{user.email}</div>
          </div>
          <div className="user-actions">
            <ThemeToggle />
            <button type="button" className="icon-btn" onClick={signOut} aria-label="Sign out" title="Sign out"><LogoutIcon /></button>
          </div>
        </div>
      </aside>
      <div className={`scrim ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)} />

      <section className="main">
        <div className="topbar">
          <button type="button" className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open chats"><MenuIcon /></button>
          <div className="brand">ShamsAI</div>
          <button type="button" className="icon-btn" onClick={newChat} aria-label="New chat"><PlusIcon /></button>
        </div>

        <div className="scroll">
          {messages.length === 0 ? (
            <div className="hello">
              <Orb interactive />
              <h2>Assalam o Alaikum, {first}</h2>
              <p>What are we working on today?</p>
              <div className="chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="thread" role="log" aria-live="polite">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="msg user"><div className="bubble">{m.content}</div></div>
                ) : (
                  <div key={i} className="msg ai">
                    <div className="lead"><Orb size="sm" busy={busy && i === messages.length - 1} /></div>
                    <div className="body">
                      {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : lastIsEmptyAi && i === messages.length - 1 ? <div className="thinking">Thinking</div> : null}
                    </div>
                  </div>
                )
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="composer-wrap">
          {notice && <div className="notice" role="alert" style={{ margin: "0 auto 10px", maxWidth: 760 }}>{notice}</div>}
          <div className="composer">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message ShamsAI"
              aria-label="Message ShamsAI"
            />
            {busy ? (
              <button type="button" className="send" onClick={stop} aria-label="Stop reply"><StopIcon /></button>
            ) : (
              <button type="button" className="send" onClick={() => send()} disabled={!input.trim()} aria-label="Send message"><SendIcon /></button>
            )}
          </div>
          <div className="footnote">ShamsAI can make mistakes. Check important information.</div>
        </div>
      </section>
    </div>
  );
}
