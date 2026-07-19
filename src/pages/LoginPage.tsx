import { useEffect } from "react";

const DASHBOARD_URL = (import.meta.env.VITE_DASHBOARD_URL || "https://portal.nexsus-co.com")
  .replace(/\/login\/?$/, "");
const LOGIN_URL     = `${DASHBOARD_URL}/login`;

/**
 * /login on the landing page — immediately redirects to the dashboard login.
 * This is a fallback in case someone navigates here directly.
 */
export default function LoginPage() {
  useEffect(() => {
    // Use replace so the back button doesn't loop back here
    window.location.replace(LOGIN_URL);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#071a3e",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: "linear-gradient(135deg, #1d4ed8, #0891b2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        fontSize: 26,
        fontWeight: 800,
        color: "#fff",
        boxShadow: "0 0 30px rgba(8,145,178,0.4)",
      }}>
        N
      </div>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
        Redirecting to your dashboard…
      </p>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
