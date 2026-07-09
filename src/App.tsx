import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState, useCallback } from "react";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Topbar from "./components/Topbar";
import CustomCursor from "./components/Cursor";
import SplashScreen from "./components/SplashScreen";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OpenAccount from "./pages/OpenAccount";
import AccountPending from "./pages/AccountPending";
import PersonalPage from "./pages/PersonalPage";
import CooperatePage from "./pages/CooperatePage";
import InsurancePage from "./pages/InsurancePage";
import MortgagesPage from "./pages/MortgagesPage";
import SavingsPage from "./pages/SavingsPage";
import CreditCardsPage from "./pages/CreditCardsPage";
import BusinessLoansPage from "./pages/BusinessLoansPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AdminSupportPage from "./pages/AdminSupportPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./index.css";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function NoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ScrollToTop must be OUTSIDE <Switch> — Switch only renders the first matching Route
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/">
          <Layout><HomePage /></Layout>
        </Route>
        <Route path="/login">
          <NoLayout><LoginPage /></NoLayout>
        </Route>
        <Route path="/open-account">
          <Layout><OpenAccount /></Layout>
        </Route>
        <Route path="/account-pending">
          <Layout><AccountPending /></Layout>
        </Route>
        <Route path="/personal">
          <Layout><PersonalPage /></Layout>
        </Route>
        <Route path="/cooperate">
          <Layout><CooperatePage /></Layout>
        </Route>
        <Route path="/insurance">
          <Layout><InsurancePage /></Layout>
        </Route>
        <Route path="/mortgages">
          <Layout><MortgagesPage /></Layout>
        </Route>
        <Route path="/savings">
          <Layout><SavingsPage /></Layout>
        </Route>
        <Route path="/credit-cards">
          <Layout><CreditCardsPage /></Layout>
        </Route>
        <Route path="/business-loans">
          <Layout><BusinessLoansPage /></Layout>
        </Route>
        <Route path="/about">
          <Layout><AboutPage /></Layout>
        </Route>
        <Route path="/contact">
          <Layout><ContactPage /></Layout>
        </Route>
        <Route path="/privacy-policy">
          <Layout><PrivacyPolicyPage /></Layout>
        </Route>
        <Route path="/admin-support">
          <NoLayout><AdminSupportPage /></NoLayout>
        </Route>
        <Route>
          <Layout><NotFoundPage /></Layout>
        </Route>
      </Switch>
    </>
  );
}

export default function App() {
  // Show splash only once per browser session
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem("nb_splash_done") === "1";
  });

  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem("nb_splash_done", "1");
    setSplashDone(true);
  }, []);

  return (
    <AuthProvider>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <div style={{
        opacity: splashDone ? 1 : 0,
        transition: splashDone ? "opacity 0.5s ease" : "none",
      }}>
        <CustomCursor />
        <Router />
      </div>
    </AuthProvider>
  );
}
