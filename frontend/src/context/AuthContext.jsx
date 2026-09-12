/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TOKEN_KEY, authApi, userApi } from "../lib/api";
import { extractToken } from "../lib/format";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const me = await userApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (token) await fetchMe();
      setBooting(false);
    })();
  }, [token, fetchMe]);

  const saveSession = useCallback(
    async (data) => {
      const t = extractToken(data);
      if (t) {
        localStorage.setItem(TOKEN_KEY, t);
        setToken(t);
      }
      // Backend register/login only returns {user_id,email,token} — fetch full profile
      if (t) await fetchMe();
    },
    [fetchMe]
  );

  const login = useCallback(
    async (payload) => {
      const data = await authApi.login(payload);
      await saveSession(data);
      return data;
    },
    [saveSession]
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      await saveSession(data);
      return data;
    },
    [saveSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, booting, isAuthed: Boolean(token), login, register, logout, refreshMe: fetchMe }),
    [token, user, booting, login, register, logout, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
