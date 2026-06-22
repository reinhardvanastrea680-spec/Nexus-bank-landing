import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Topbar from "./components/Topbar";
import CustomCursor from "./components/Cursor";

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
import AdminSupportPage from "./pages/AdminSupportPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./index.css";

// Always use root — Vercel serves from "/"
const base = "";

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

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <ScrollToTop />
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
      <Route path="/admin-support">
        <NoLayout><AdminSupportPage /></NoLayout>
      </Route>
      <Route>
        <Layout><NotFoundPage /></Layout>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WouterRouter base={base}>
        <CustomCursor />
        <Router />
      </WouterRouter>
    </AuthProvider>
  );
}
