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
  switchChurchRequest,
} from "@/lib/api/auth";
import {
  clearAuthSession,
  getStoredChurchId,
  persistActiveChurch,
} from "@/lib/auth/cookies";
import { PUBLIC_ROUTES } from "@/constants/routes";
import type { Church, LoginCredentials, User, UserPermissions } from "@/types/auth";

function redirectToLogin() {
  window.location.replace(PUBLIC_ROUTES.login);
}

interface AuthContextValue {
  user: User | null;
  church: Church | null;
  churches: Church[];
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchChurch: (churchId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveActiveChurch(session: {
  church: Church;
  churches: Church[];
}): Church {
  const storedChurchId = getStoredChurchId();

  return (
    session.churches.find((item) => item.id === storedChurchId) ??
    session.church
  );
}

function applySession(
  session: {
    user: User;
    church: Church;
    churches: Church[];
    permissions: UserPermissions;
    tokens: { expiresIn: number };
  },
  preferredChurch?: Church,
) {
  const activeChurch = preferredChurch ?? resolveActiveChurch(session);

  return {
    user: session.user,
    church: activeChurch,
    churches: session.churches,
    permissions: session.permissions,
    expiresIn: session.tokens.expiresIn,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const session = await getSessionRequest();

        if (cancelled) {
          return;
        }

        const next = applySession(session);

        setUser(next.user);
        setChurch(next.church);
        setChurches(next.churches);
        setPermissions(next.permissions);
        persistActiveChurch(next.church.id, next.expiresIn);
      } catch {
        if (cancelled) {
          return;
        }

        clearAuthSession();
        setUser(null);
        setChurch(null);
        setChurches([]);
        setPermissions(null);
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
    const next = applySession(session);

    persistActiveChurch(next.church.id, next.expiresIn);

    setUser(next.user);
    setChurch(next.church);
    setChurches(next.churches);
    setPermissions(next.permissions);
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
    setPermissions(null);
    redirectToLogin();
  }, []);

  const switchChurch = useCallback(
    async (churchId: string) => {
      const nextChurch = churches.find((item) => item.id === churchId);

      if (!nextChurch || !user) {
        return;
      }

      const session = await switchChurchRequest(churchId);
      const next = applySession(session, nextChurch);

      setUser(next.user);
      setChurch(next.church);
      setChurches(next.churches);
      setPermissions(next.permissions);
      persistActiveChurch(next.church.id, next.expiresIn);
    },
    [churches, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      church,
      churches,
      permissions,
      isAuthenticated: Boolean(user && church),
      isLoading,
      login,
      logout,
      switchChurch,
    }),
    [church, churches, isLoading, login, logout, permissions, switchChurch, user],
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
