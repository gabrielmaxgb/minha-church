import {
  AUTH_COOKIE,
  CHURCH_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/auth/constants";

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string, maxAge = DEFAULT_MAX_AGE) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return getCookie(AUTH_COOKIE);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_COOKIE);
}

export function getStoredChurchId(): string | null {
  return getCookie(CHURCH_COOKIE);
}

export function persistAuthSession(
  accessToken: string,
  churchId: string,
  refreshToken?: string,
  expiresIn = DEFAULT_MAX_AGE,
) {
  setCookie(AUTH_COOKIE, accessToken, expiresIn);
  setCookie(CHURCH_COOKIE, churchId, expiresIn);

  if (refreshToken) {
    setCookie(REFRESH_COOKIE, refreshToken, expiresIn * 4);
  }
}

export function clearAuthSession() {
  deleteCookie(AUTH_COOKIE);
  deleteCookie(REFRESH_COOKIE);
  deleteCookie(CHURCH_COOKIE);
}
