import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/*
  Each person's chats live at  users/{uid}/chats/{chatId}  and the Firestore
  security rules (firestore.rules) let ONLY that person read or write them.
  In local dev mode (guest) chats are kept in this browser's localStorage.
*/

const LS_KEY = "shamsai-guest-chats";

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
};
const writeLocal = (list) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
};

export async function loadChats(user) {
  if (user.guest || !db) return readLocal().sort((a, b) => b.updatedAt - a.updatedAt);
  const snap = await getDocs(query(collection(db, "users", user.uid, "chats"), orderBy("updatedAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveChat(user, chat) {
  const data = { title: chat.title, messages: chat.messages, updatedAt: chat.updatedAt };
  if (user.guest || !db) {
    const list = readLocal().filter((c) => c.id !== chat.id);
    list.push({ id: chat.id, ...data });
    writeLocal(list);
    return;
  }
  await setDoc(doc(db, "users", user.uid, "chats", chat.id), data);
}

export async function removeChat(user, id) {
  if (user.guest || !db) {
    writeLocal(readLocal().filter((c) => c.id !== id));
    return;
  }
  await deleteDoc(doc(db, "users", user.uid, "chats", id));
}
