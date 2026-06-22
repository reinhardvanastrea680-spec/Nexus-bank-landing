import { createRoot } from "react-dom/client";
import { Component, Suspense, type ReactNode } from "react";
import App from "./App";
import "./index.css";

// ── Root Error Boundary ──────────────────────────────────────────────────────
// Prevents any JS crash from leaving a blank white page.
class RootErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#071a3e",
            color: "#fff",
            fontFamily: "sans-serif",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>🏦</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            Nexus Bank
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", maxWidth: 440, lineHeight: 1.6 }}>
            We hit an unexpected error. Please refresh the page.
          </p>
          {import.meta.env.DEV && (
            <pre
              style={{
                marginTop: 20,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: 16,
                fontSize: 12,
                color: "#f87171",
                maxWidth: 600,
                textAlign: "left",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {(error as Error).message}
              {"\n\n"}
              {(error as Error).stack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              padding: "12px 32px",
              borderRadius: 100,
              background: "#0891b2",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#071a3e",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "linear-gradient(135deg,#1d4ed8,#0891b2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 800,
          fontSize: 20,
          fontFamily: "sans-serif",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        N
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ── Mount ────────────────────────────────────────────────────────────────────
const root = document.getElementById("root");
if (!root) throw new Error("No #root element found in index.html");

createRoot(root).render(
  <RootErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <App />
    </Suspense>
  </RootErrorBoundary>
);
