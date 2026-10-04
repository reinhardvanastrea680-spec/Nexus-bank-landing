import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(<App />);

// Debug: confirm React mounted - remove this after confirming site works
console.log("[Nexsus] React mounted. Root children:", rootEl.children.length);

// Register Firebase Messaging Service Worker for push notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Firebase Service Worker registered:', registration);
    })
    .catch((error) => {
      console.log('Firebase Service Worker registration failed:', error);
    });
}
