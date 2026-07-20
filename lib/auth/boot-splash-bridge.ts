/**
 * Continuidade da splash entre remount (Strict Mode) e hard nav login → /app.
 */

const STORAGE_KEY = "mc.bootSplash.v1";
const MAX_AGE_MS = 12_000;

export type BootSplashSeed = {
  progress: number;
  at: number;
};

/** Sobrevive ao unmount/remount do Strict Mode na mesma navegação. */
let memorySeed: BootSplashSeed | null = null;

export function stashBootSplashProgress(progress: number): void {
  const clamped = Math.min(0.92, Math.max(0, progress));
  const seed: BootSplashSeed = { progress: clamped, at: Date.now() };
  memorySeed = seed;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // private mode / quota — memória ainda cobre Strict Mode
  }
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

export function clearBootSplashSeed(): void {
  memorySeed = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
