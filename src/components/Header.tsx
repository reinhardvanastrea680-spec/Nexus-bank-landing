import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Personal", href: "/personal" },
  { label: "Business", href: "/cooperate" },
  { label: "Insurance", href: "/insurance" },
  { label: "Mortgages", href: "/mortgages" },
  { label: "Savings", href: "/savings" },
  { label: "Business Loans", href: "/business-loans" },
  { label: "Credit Cards", href: "/credit-cards" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <>
      <header className="main-header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="header-logo">
              <div className="logo-mark">N</div>
              <div>
                <div className="logo-text">Nexus Bank</div>
                <div className="logo-sub">Banking Beyond Boundaries</div>
              </div>
            </Link>

            <nav className="main-nav">
              {navLinks.map((n) => (
                <Link key={n.href} href={n.href} className={location === n.href ? "active" : ""}>{n.label}</Link>
              ))}
            </nav>

            <div className="header-actions">
              {user ? (
                <>
                  <span style={{ fontSize: 13, color: "var(--text-body)", whiteSpace: "nowrap" }}>
                    Hi, {user.firstName}
                  </span>
                  <button className="btn-login-header" onClick={logout}>Log Out</button>
                </>
              ) : (
                <>
                  <a href={`${import.meta.env.VITE_DASHBOARD_URL || "https://nexus-bank-mu.vercel.app"}/login`} className="btn-login-header">Log In</a>
                  <Link href="/open-account" className="btn btn-primary btn-sm">Open Account</Link>
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

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div className="logo-mark">N</div>
          <div className="logo-text">Nexus Bank</div>
        </div>
        <nav className="mobile-nav">
          {navLinks.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</Link>
          ))}
        </nav>
        <div className="mobile-nav-actions">
          {user ? (
            <button className="btn btn-outline w-full" onClick={() => { void logout(); setMenuOpen(false); }}>
              Log Out ({user.firstName})
            </button>
          ) : (
            <>
              <a href={`${import.meta.env.VITE_DASHBOARD_URL || "https://nexus-bank-mu.vercel.app"}/login`} className="btn btn-outline w-full" onClick={() => setMenuOpen(false)}>Log In</a>
              <Link href="/open-account" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>Open Account</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
