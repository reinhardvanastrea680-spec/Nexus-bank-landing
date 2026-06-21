import { useEffect } from "react";

// Dashboard URL — update this to your deployed dashboard URL
const DASHBOARD_LOGIN_URL = (import.meta.env.VITE_DASHBOARD_URL || "https://nexus-bank-mu.vercel.app") + "/login";

export default function LoginPage() {
  useEffect(() => {
    window.location.href = DASHBOARD_LOGIN_URL;
  }, []);

  // Fallback UI while redirecting
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #F0F4F8 0%, #E4EDF9 100%)",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: "linear-gradient(135deg, #1D4ED8, #0EA5E9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        fontSize: 24,
        fontWeight: 700,
        color: "#fff",
      }}>N</div>
      <p style={{ color: "#64748B", fontSize: 15 }}>Redirecting to your dashboard…</p>
    </div>
  );
}
