import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? "placeholder",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? "placeholder.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? "placeholder",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? "placeholder.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? "1:000000000000:web:placeholder",
};

// Avoid duplicate app init on HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const ADMIN_UID = (import.meta.env.VITE_ADMIN_UID ?? "") as string;
