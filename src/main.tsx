import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(<App />);

// Debug: confirm React mounted - remove this after confirming site works
console.log("[Nexsus] React mounted. Root children:", rootEl.children.length);
