import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { configureApiClient } from "../apiClient";
import { AuthUser, fetchCurrentUser, loginRequest, registerRequest } from "../authService";
import { clearToken, getSavedToken, saveToken } from "../secureStorage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tokenRef = useRef<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((nextToken: string | null) => {
    tokenRef.current = nextToken;
  }, []);

  const handleUnauthorized = useCallback(async () => {
    tokenRef.current = null;
    setUser(null);
    await clearToken();
  }, []);

  useEffect(() => {
    configureApiClient(() => tokenRef.current, handleUnauthorized);
  }, [handleUnauthorized]);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const saved = await getSavedToken();
        if (saved) {
          applyToken(saved);
          const me = await fetchCurrentUser();
          if (mounted) {
            setUser(me);
          }
        }
      } catch (e) {
        await handleUnauthorized();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [applyToken, handleUnauthorized]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    applyToken(response.accessToken);
    setUser(response.user);
    await saveToken(response.accessToken);
  }, [applyToken]);

  const register = useCallback(async (email: string, password: string) => {
    const response = await registerRequest(email, password);
    applyToken(response.accessToken);
    setUser(response.user);
    await saveToken(response.accessToken);
  }, [applyToken]);

  const logout = useCallback(async () => {
    applyToken(null);
    setUser(null);
    await clearToken();
  }, [applyToken]);

  const value = useMemo(
    () => ({
      user,
      token: tokenRef.current,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
