"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSessionRequest,
  loginRequest,
  logoutRequest,
} from "@/lib/api/auth";
import {
  clearAuthSession,
  getAccessToken,
  getStoredChurchId,
  persistAuthSession,
} from "@/lib/auth/cookies";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { isTokenExpired } from "@/lib/auth/jwt";
import type { Church, LoginCredentials, User } from "@/types/auth";

function redirectToLogin() {
  window.location.replace(PUBLIC_ROUTES.login);
}

interface AuthContextValue {
  user: User | null;
  church: Church | null;
  churches: Church[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchChurch: (churchId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getValidAccessToken(): string | null {
  const token = getAccessToken();

  if (!token || isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }

  return token;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(() => getValidAccessToken() !== null);

  useEffect(() => {
    const token = getValidAccessToken();

    if (!token) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const session = await getSessionRequest(token);

        if (cancelled) {
          return;
        }

        const storedChurchId = getStoredChurchId();
        const activeChurch =
          session.churches.find((item) => item.id === storedChurchId) ??
          session.church;
        const accessToken = session.tokens.accessToken || token;

        setUser(session.user);
        setChurch(activeChurch);
        setChurches(session.churches);
        persistAuthSession(
          accessToken,
          activeChurch.id,
          session.tokens.refreshToken,
          session.tokens.expiresIn,
        );
      } catch {
        if (cancelled) {
          return;
        }

        clearAuthSession();
        setUser(null);
        setChurch(null);
        setChurches([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await loginRequest(credentials);

    persistAuthSession(
      session.tokens.accessToken,
      session.church.id,
      session.tokens.refreshToken,
      session.tokens.expiresIn,
    );

    setUser(session.user);
    setChurch(session.church);
    setChurches(session.churches);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Ignora falha de logout remoto — sessão local sempre é encerrada.
    }

    clearAuthSession();
    setUser(null);
    setChurch(null);
    setChurches([]);
    redirectToLogin();
  }, []);

  const switchChurch = useCallback(
    async (churchId: string) => {
      const nextChurch = churches.find((item) => item.id === churchId);

      if (!nextChurch || !user) {
        return;
      }

      const token = getAccessToken();

      if (!token) {
        return;
      }

      setChurch(nextChurch);
      persistAuthSession(token, nextChurch.id);
    },
    [churches, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      church,
      churches,
      isAuthenticated: Boolean(user && church),
      isLoading,
      login,
      logout,
      switchChurch,
    }),
    [church, churches, isLoading, login, logout, switchChurch, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}

export function useTenant() {
  const { church, churches, switchChurch, isAuthenticated } = useAuth();

  return {
    churchId: church?.id ?? null,
    church,
    churches,
    switchChurch,
    isAuthenticated,
  };
}

export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      redirectToLogin();
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return auth;
}

export { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
