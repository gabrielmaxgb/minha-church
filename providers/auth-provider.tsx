"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  changePasswordRequest,
  getSessionRequest,
  loginRequest,
  logoutRequest,
  refreshSessionDeduped,
  switchChurchRequest,
  updateProfileRequest,
} from "@/lib/api/auth";
import {
  resetTenantQueryCache,
  waitForActiveTenantQueries,
} from "@/lib/api/queries/reset-tenant-cache";
import {
  clearAuthSession,
  getStoredChurchId,
  persistActiveChurch,
} from "@/lib/auth/cookies";
import { terminateSession } from "@/lib/auth/session";
import { isProtectedAreaPath, PUBLIC_ROUTES } from "@/constants/routes";
import type { AuthResponse, ChangePasswordPayload, Church, LoginCredentials, UpdateProfilePayload, User, UserPermissions } from "@/types/auth";

function redirectToLogin() {
  window.location.replace(`${PUBLIC_ROUTES.login}?force=1`);
}

async function handleInvalidSession(
  setters: {
    setUser: (user: User | null) => void;
    setChurch: (church: Church | null) => void;
    setChurches: (churches: Church[]) => void;
    setPermissions: (permissions: UserPermissions | null) => void;
  },
  options?: { hardRedirect?: boolean },
) {
  await terminateSession();
  setters.setUser(null);
  setters.setChurch(null);
  setters.setChurches([]);
  setters.setPermissions(null);

  if (
    options?.hardRedirect &&
    typeof window !== "undefined" &&
    isProtectedAreaPath(window.location.pathname)
  ) {
    window.location.replace(`${PUBLIC_ROUTES.login}?force=1`);
  }
}

interface AuthContextValue {
  user: User | null;
  church: Church | null;
  churches: Church[];
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSwitchingChurch: boolean;
  switchingToChurchName: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  switchChurch: (churchId: string) => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

const CHURCH_SWITCH_MIN_OVERLAY_MS = 400;

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
  session: AuthResponse,
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

function commitSession(
  session: AuthResponse,
  preferredChurch: Church | undefined,
  setters: {
    setUser: (user: User) => void;
    setChurch: (church: Church) => void;
    setChurches: (churches: Church[]) => void;
    setPermissions: (permissions: UserPermissions) => void;
  },
) {
  const next = applySession(session, preferredChurch);

  setters.setUser(next.user);
  setters.setChurch(next.church);
  setters.setChurches(next.churches);
  setters.setPermissions(next.permissions);
  persistActiveChurch(next.church.id);

  return next;
}

async function loadSession(): Promise<AuthResponse> {
  try {
    return await getSessionRequest();
  } catch {
    return refreshSessionDeduped();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingChurch, setIsSwitchingChurch] = useState(false);
  const [switchingToChurchName, setSwitchingToChurchName] = useState<string | null>(
    null,
  );
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSwitchingChurchRef = useRef(false);

  const sessionSetters = useMemo(
    () => ({
      setUser,
      setChurch,
      setChurches,
      setPermissions,
    }),
    [],
  );

  const scheduleTokenRefresh = useCallback(
    (expiresIn: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      const refreshInMs = Math.max((expiresIn - 60) * 1000, 30_000);

      refreshTimerRef.current = setTimeout(() => {
        void (async () => {
          try {
            const session = await refreshSessionDeduped();
            commitSession(session, undefined, sessionSetters);
            scheduleTokenRefresh(session.tokens.expiresIn);
          } catch {
            await handleInvalidSession(sessionSetters);
            redirectToLogin();
          }
        })();
      }, refreshInMs);
    },
    [sessionSetters],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const session = await loadSession();

        if (cancelled) {
          return;
        }

        const next = commitSession(session, undefined, sessionSetters);
        scheduleTokenRefresh(next.expiresIn);
      } catch {
        if (cancelled) {
          return;
        }

        await handleInvalidSession(sessionSetters, { hardRedirect: true });
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleTokenRefresh, sessionSetters]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const session = await loginRequest(credentials);
      const next = commitSession(session, undefined, sessionSetters);

      scheduleTokenRefresh(next.expiresIn);
      setIsLoading(false);

      return session;
    },
    [scheduleTokenRefresh, sessionSetters],
  );

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload) => {
      const session = await changePasswordRequest(payload);
      const next = commitSession(session, undefined, sessionSetters);

      scheduleTokenRefresh(next.expiresIn);
    },
    [scheduleTokenRefresh, sessionSetters],
  );

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const session = await updateProfileRequest(payload);
      const next = commitSession(session, undefined, sessionSetters);

      scheduleTokenRefresh(next.expiresIn);
    },
    [scheduleTokenRefresh, sessionSetters],
  );

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

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
      if (churchId === church?.id || isSwitchingChurchRef.current) {
        return;
      }

      const nextChurch = churches.find((item) => item.id === churchId);

      if (!nextChurch || !user) {
        return;
      }

      isSwitchingChurchRef.current = true;
      setSwitchingToChurchName(nextChurch.name);
      setIsSwitchingChurch(true);

      const startedAt = Date.now();

      try {
        const session = await switchChurchRequest(churchId);

        flushSync(() => {
          commitSession(session, nextChurch, sessionSetters);
        });

        resetTenantQueryCache(queryClient);
        await waitForActiveTenantQueries(queryClient);
        scheduleTokenRefresh(
          applySession(session, nextChurch).expiresIn,
        );
      } finally {
        const elapsed = Date.now() - startedAt;

        if (elapsed < CHURCH_SWITCH_MIN_OVERLAY_MS) {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, CHURCH_SWITCH_MIN_OVERLAY_MS - elapsed);
          });
        }

        isSwitchingChurchRef.current = false;
        setIsSwitchingChurch(false);
        setSwitchingToChurchName(null);
      }
    },
    [church?.id, churches, queryClient, scheduleTokenRefresh, sessionSetters, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      church,
      churches,
      permissions,
      isAuthenticated: Boolean(user && church),
      isLoading,
      isSwitchingChurch,
      switchingToChurchName,
      login,
      logout,
      switchChurch,
      changePassword,
      updateProfile,
    }),
    [
      changePassword,
      church,
      churches,
      isLoading,
      isSwitchingChurch,
      login,
      logout,
      permissions,
      switchChurch,
      switchingToChurchName,
      updateProfile,
      user,
    ],
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
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (auth.isLoading || auth.isAuthenticated || redirectingRef.current) {
      return;
    }

    redirectingRef.current = true;

    void terminateSession().finally(() => {
      window.location.replace(`${PUBLIC_ROUTES.login}?force=1`);
    });
  }, [auth.isAuthenticated, auth.isLoading]);

  return auth;
}

export { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
