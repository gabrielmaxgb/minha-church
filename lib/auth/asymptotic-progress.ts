/**
 * Progresso assintótico: sobe rápido no começo, freia perto do teto,
 * só completa quando `ready` fica true (padrão clássico de splash/boot).
 */

export const ASYMPTOTE_CEILING = 0.9;
export const MIN_SPLASH_MS = 450;
export const COMPLETE_HOLD_MS = 280;

/** Aproxima `ceiling` com ease-out exponencial (nunca chega sozinho a 1). */
export function nextAsymptoticValue(
  current: number,
  dtMs: number,
  ceiling = ASYMPTOTE_CEILING,
): number {
  if (current >= ceiling) {
    return ceiling;
  }

  // ~1.8s até ~90% em condições normais; frena forte perto do teto.
  const rate = 0.0028;
  const remaining = ceiling - current;
  const step = remaining * (1 - Math.exp(-rate * dtMs));
  return Math.min(ceiling, current + Math.max(step, 0.0004));
}

export type AsymptoticProgressPhase = "booting" | "completing" | "done";

export interface AsymptoticProgressController {
  get value(): number;
  get phase(): AsymptoticProgressPhase;
  setReady(ready: boolean): void;
  start(onTick: (value: number, phase: AsymptoticProgressPhase) => void): void;
  stop(): void;
}

export function createAsymptoticProgress(options?: {
  ceiling?: number;
  minMs?: number;
  completeHoldMs?: number;
  initialValue?: number;
}): AsymptoticProgressController {
  const ceiling = options?.ceiling ?? ASYMPTOTE_CEILING;
  const minMs = options?.minMs ?? MIN_SPLASH_MS;
  const completeHoldMs = options?.completeHoldMs ?? COMPLETE_HOLD_MS;
  const initialValue = Math.min(
    ceiling,
    Math.max(0, options?.initialValue ?? 0),
  );

  let value = initialValue;
  let phase: AsymptoticProgressPhase = "booting";
  let ready = false;
  let startedAt = 0;
  let completeAt: number | null = null;
  let rafId: number | null = null;
  let lastTs = 0;
  let onTick: ((value: number, phase: AsymptoticProgressPhase) => void) | null =
    null;

  function emit() {
    onTick?.(value, phase);
  }

  function frame(ts: number) {
    if (!lastTs) {
      lastTs = ts;
    }
    const dt = Math.min(64, ts - lastTs);
    lastTs = ts;

    if (phase === "booting") {
      value = nextAsymptoticValue(value, dt, ceiling);

      if (ready && performance.now() - startedAt >= minMs) {
        phase = "completing";
        completeAt = null;
      }
    } else if (phase === "completing") {
      const remaining = 1 - value;
      value = Math.min(1, value + Math.max(remaining * 0.18, 0.04));
      if (value >= 0.999) {
        value = 1;
        if (completeAt == null) {
          completeAt = performance.now();
        } else if (performance.now() - completeAt >= completeHoldMs) {
          phase = "done";
          emit();
          stop();
          return;
        }
      }
    }

    emit();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return {
    get value() {
      return value;
    },
    get phase() {
      return phase;
    },
    setReady(next) {
      ready = next;
    },
    start(tick) {
      stop();
      onTick = tick;
      // Não zera se já veio seed (continuidade login → /app / Strict Mode).
      if (value <= 0) {
        value = initialValue;
      }
      phase = "booting";
      ready = false;
      startedAt = performance.now();
      // Seed alto: encurta o “mínimo” pra não prender a splash.
      if (initialValue >= 0.5) {
        startedAt -= minMs;
      }
      completeAt = null;
      lastTs = 0;
      emit();
      rafId = requestAnimationFrame(frame);
    },
    stop,
  };
}
