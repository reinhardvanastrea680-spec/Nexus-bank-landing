import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ── Firebase config — all values come from Vite env vars ──────────────────
// Fallback strings prevent initializeApp() from throwing on missing vars.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             ?? "AIzaSy_placeholder",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         ?? "nexus-bank-b6820.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          ?? "nexus-bank-b6820",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      ?? "nexus-bank-b6820.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              ?? "1:000000000000:web:placeholder",
};

// Safely initialize — never throw even if called multiple times (HMR)
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn("[firebase] init error:", e);
  app = getApps()[0] ?? initializeApp(firebaseConfig);
}

export const db        = getFirestore(app);
export const ADMIN_UID = (import.meta.env.VITE_ADMIN_UID ?? "rxj5upvJRFaUDqmH7Evfk95QuYN2") as string;
