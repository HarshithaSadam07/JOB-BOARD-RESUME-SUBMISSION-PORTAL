import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // {id, name, email, role, companyId}
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem("access_token");

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem("access_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchMe();
    else setLoading(false);
    // eslint-disable-next-line
  }, []);

  const login = async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    // expecting { accessToken, refreshToken, user? } — if user not returned, /me will fetch
    localStorage.setItem("access_token", data.accessToken || data.access_token || "");
    await fetchMe();
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
