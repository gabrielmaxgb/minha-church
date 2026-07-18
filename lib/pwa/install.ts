/**
 * Helpers PWA — instalação e display mode.
 * Sem side-effects; seguro importar em client components.
 */

export const PWA_DISMISS_KEY = "mc.pwa.install.dismissedAt";
/** Não insistir por 21 dias após “Agora não”. */
export const PWA_DISMISS_COOLDOWN_MS = 21 * 24 * 60 * 60 * 1000;

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  return media || iosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

export function isDismissedRecently(now = Date.now()): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    const raw = window.localStorage.getItem(PWA_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return now - dismissedAt < PWA_DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

export function markInstallDismissed(): void {
  try {
    window.localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
  } catch {
    // private mode / quota — ignore
  }
}

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
