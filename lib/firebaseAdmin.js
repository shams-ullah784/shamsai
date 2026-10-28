import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const adminReady = Boolean(projectId && clientEmail && privateKey);

function adminApp() {
  if (getApps().length) return getApps()[0];
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

/** Returns the Firebase uid for a valid ID token, otherwise null. */
export async function verifyToken(idToken) {
  if (!adminReady || !idToken) return null;
  try {
    const decoded = await getAuth(adminApp()).verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}
