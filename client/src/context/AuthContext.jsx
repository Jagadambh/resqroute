import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("resqroute_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginWithRole = useCallback(async (role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/demo-login", { role });
      localStorage.setItem("resqroute_token", res.data.token);
      localStorage.setItem("resqroute_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("resqroute_token");
    localStorage.removeItem("resqroute_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
