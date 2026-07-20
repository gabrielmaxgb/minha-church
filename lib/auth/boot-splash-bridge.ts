/**
 * Continuidade da splash entre remount (Strict Mode), hard nav login → /app,
 * e controle do Host único (label/ready sem remountar a arte).
 */

const STORAGE_KEY = "mc.bootSplash.v1";
const MAX_AGE_MS = 12_000;

export type BootSplashSeed = {
  progress: number;
  at: number;
  /** Label em voo no hard nav — Host retoma e só dá refresh no texto. */
  label?: string;
};

export type BootSplashLiveState = {
  active: boolean;
  ready: boolean;
  label: string;
};

const DEFAULT_LABEL = "Preparando sua igreja…";
const ENTERING_LABEL = "Entrando na sua igreja…";

/** Sobrevive ao unmount/remount do Strict Mode na mesma navegação. */
let memorySeed: BootSplashSeed | null = null;

let live: BootSplashLiveState = {
  active: false,
  ready: false,
  label: DEFAULT_LABEL,
};

const liveListeners = new Set<() => void>();

function notifyLive() {
  for (const listener of liveListeners) {
    listener();
  }
}

export function getBootSplashEnteringLabel() {
  return ENTERING_LABEL;
}

export function getBootSplashDefaultLabel() {
  return DEFAULT_LABEL;
}

export function getBootSplashLiveState(): BootSplashLiveState {
  return live;
}

export function subscribeBootSplashLive(listener: () => void): () => void {
  liveListeners.add(listener);
  return () => {
    liveListeners.delete(listener);
  };
}

/** Login (e fluxos similares): abre a splash no Host sem montar outra instância. */
export function startBootSplash(label: string = ENTERING_LABEL): void {
  live = { active: true, ready: false, label };
  stashBootSplashProgress(0, label);
  notifyLive();
}

export function setBootSplashLabel(label: string): void {
  if (!live.active || live.label === label) {
    return;
  }
  live = { ...live, label };
  stashBootSplashProgress(getStashedProgressHint(), label);
  notifyLive();
}

export function setBootSplashReady(): void {
  if (!live.active || live.ready) {
    return;
  }
  live = { ...live, ready: true };
  notifyLive();
}

export function clearBootSplashLive(): void {
  live = { active: false, ready: false, label: DEFAULT_LABEL };
  notifyLive();
}

export function stashBootSplashProgress(progress: number, label?: string): void {
  const clamped = Math.min(0.92, Math.max(0, progress));
  const seed: BootSplashSeed = {
    progress: clamped,
    at: Date.now(),
    label: label ?? live.label ?? memorySeed?.label,
  };
  memorySeed = seed;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // private mode / quota — memória ainda cobre Strict Mode
  }
}

function getStashedProgressHint(): number {
  return memorySeed?.progress ?? 0;
}

/** Lê e consome o seed (session + memória). */
export function consumeBootSplashSeed(): number {
  let seed: BootSplashSeed | null = memorySeed;
  memorySeed = null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BootSplashSeed;
      if (
        typeof parsed?.progress === "number" &&
        typeof parsed?.at === "number"
      ) {
        seed = parsed;
      }
    }
  } catch {
    // ignore
  }

  if (!seed) {
    return 0;
  }
  if (Date.now() - seed.at > MAX_AGE_MS) {
    return 0;
  }
  return Math.min(0.92, Math.max(0, seed.progress));
}

/** Consome só o label persistido (hard nav) sem zerar o progresso. */
export function peekBootSplashLabel(): string | null {
  const fromLive = live.active ? live.label : null;
  if (fromLive) {
    return fromLive;
  }

  const seed = memorySeed;
  if (seed?.label && Date.now() - seed.at <= MAX_AGE_MS) {
    return seed.label;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as BootSplashSeed;
    if (
      parsed?.label &&
      typeof parsed.at === "number" &&
      Date.now() - parsed.at <= MAX_AGE_MS
    ) {
      return parsed.label;
    }
  } catch {
    // ignore
  }

  return null;
}

export function clearBootSplashSeed(): void {
  memorySeed = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
