import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

// Hardcoded dashboard URL — overridable via env var
// Strip trailing /login if someone set VITE_DASHBOARD_URL with it already included
const DASHBOARD_URL = (import.meta.env.VITE_DASHBOARD_URL || "https://portal.nexsus-co.com")
  .replace(/\/login\/?$/, "");
const LOGIN_URL = `${DASHBOARD_URL}/login`;

const navLinks = [
  { label: "Personal",       href: "/personal" },
  { label: "Business",       href: "/cooperate" },
  { label: "Insurance",      href: "/insurance" },
  { label: "Mortgages",      href: "/mortgages" },
  { label: "Savings",        href: "/savings" },
  { label: "Business Loans", href: "/business-loans" },
  { label: "Credit Cards",   href: "/credit-cards" },
  { label: "About Us",       href: "/about" },
  { label: "Contact",        href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to external dashboard — bypass wouter entirely
    window.location.href = LOGIN_URL;
  };

  return (
    <>
      <header className="main-header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="header-logo">
              <div className="logo-mark">N</div>
              <div>
                <div className="logo-text">Nexsus Bank</div>
                <div className="logo-sub">Banking Beyond Boundaries</div>
              </div>
            </Link>

            <nav className="main-nav">
              {navLinks.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={location === n.href ? "active" : ""}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              {user ? (
                <>
                  <span style={{ fontSize: 13, color: "var(--text-body)", whiteSpace: "nowrap" }}>
                    Hi, {user.firstName}
                  </span>
                  <button className="btn-login-header" onClick={() => void logout()}>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  {/* Use window.location to guarantee external navigation */}
                  <a
                    href={LOGIN_URL}
                    className="btn-login-header"
                    onClick={handleLogin}
                  >
                    Log In
                  </a>
                  <Link href="/open-account" className="btn btn-primary btn-sm">
                    Open Account
                  </Link>
                </>
              )}
              <button
                className={`hamburger${menuOpen ? " open" : ""}`}
                aria-label="Toggle menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div className="logo-mark">N</div>
          <div className="logo-text">Nexsus Bank</div>
        </div>
        <nav className="mobile-nav">
          {navLinks.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-nav-actions">
          {user ? (
            <button
              className="btn btn-outline w-full"
              onClick={() => { void logout(); setMenuOpen(false); }}
            >
              Log Out ({user.firstName})
            </button>
          ) : (
            <>
              <a
                href={LOGIN_URL}
                className="btn btn-outline w-full"
                onClick={(e) => { e.preventDefault(); setMenuOpen(false); window.location.href = LOGIN_URL; }}
              >
                Log In
              </a>
              <Link
                href="/open-account"
                className="btn btn-primary w-full"
                onClick={() => setMenuOpen(false)}
              >
                Open Account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
