import { CHURCH_COOKIE } from "@/lib/auth/constants";

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

export function getStoredChurchId(): string | null {
  return getCookie(CHURCH_COOKIE);
}

/** Persiste apenas a igreja ativa — tokens ficam em cookies httpOnly do backend. */
export function persistActiveChurch(churchId: string, maxAge = DEFAULT_MAX_AGE) {
  setCookie(CHURCH_COOKIE, churchId, maxAge);
}

export function clearAuthSession() {
  deleteCookie(CHURCH_COOKIE);
}
