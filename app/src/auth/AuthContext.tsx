import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, tokenStorage, type AuthUser } from "../api";

const USER_KEY = "jobcheck_user";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function cachedUser(): AuthUser | null {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => cachedUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStorage.get()) {
      setReady(true);
      return;
    }
    authApi.profile()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setReady(true));
  }, []);

  const saveSession = (accessToken: string, nextUser: AuthUser) => {
    tokenStorage.set(accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login: async (identifier, password) => {
        const { data } = await authApi.login(identifier, password);
        saveSession(data.access_token, data.user);
      },
      register: async (email, password, nickname) => {
        const { data } = await authApi.register(email, password, nickname);
        saveSession(data.access_token, data.user);
      },
      logout: () => {
        tokenStorage.clear();
        localStorage.removeItem(USER_KEY);
        setUser(null);
      },
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
