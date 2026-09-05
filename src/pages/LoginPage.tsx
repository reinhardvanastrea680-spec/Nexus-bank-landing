import { useEffect } from "react";

const DASHBOARD_URL = (import.meta.env.VITE_DASHBOARD_URL || "https://portal.nexsus-co.com")
  .replace(/\/login\/?$/, "");
const LOGIN_URL     = `${DASHBOARD_URL}/login`;

/**
 * /login on the landing page — immediately redirects to the dashboard login.
 * This is a fallback in case someone navigates here directly.
 */
export default function LoginPage() {
  // Prevent search engines from indexing or following links on this page
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  useEffect(() => {
    // Prevent automatic redirect - let user click manually
    // Automatic redirects to login pages trigger phishing detection
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
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, marginBottom: 24 }}>
        Access your secure banking portal
      </p>
      <a 
        href={LOGIN_URL}
        style={{
          padding: "14px 32px",
          background: "linear-gradient(135deg, #1d4ed8, #0891b2)",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          boxShadow: "0 4px 14px rgba(29,78,216,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
      >
        Continue to Login →
      </a>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
