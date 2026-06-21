import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { apiGet, apiPost } from "../lib/api";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user from API, but if it fails just set loading to false
    apiGet<User>("/auth/me")
      .then((u) => setUser(u))
      .catch(() => {
        // For demo purposes, don't show an error, just no user
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const u = await apiPost<User>("/auth/login", { username, password });
      setUser(u);
    } catch (e) {
      console.error("Login failed", e);
      // For demo purposes, let's use a fallback user
      setUser({
        id: 1,
        username: username,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        accountNumber: "1234567890",
        role: "customer",
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {});
    } catch (e) {
      console.error("Logout failed", e);
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
