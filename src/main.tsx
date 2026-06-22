import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import App from "./App";
import "./index.css";

// Top-level error boundary — prevents a JS crash from leaving a blank white page
class RootErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Nexus Bank
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 420 }}>
            We hit an unexpected error. Please refresh the page or try again
            later.
          </p>
          {import.meta.env.DEV && (
            <pre
              style={{
                marginTop: 24,
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
              {err.message}
              {"\n\n"}
              {err.stack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              borderRadius: 100,
              background: "#0891b2",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: 14,
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

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
