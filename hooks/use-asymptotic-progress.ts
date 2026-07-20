"use client";

import { useEffect, useRef, useState } from "react";

import {
  createAsymptoticProgress,
  type AsymptoticProgressController,
  type AsymptoticProgressPhase,
} from "@/lib/auth/asymptotic-progress";
import { consumeBootSplashSeed } from "@/lib/auth/boot-splash-bridge";

type Tick = (value: number, phase: AsymptoticProgressPhase) => void;

/**
 * Singleton no módulo: Strict Mode faz unmount→mount e sem isso a barra
 * reinicia do zero (parece “carregar duas vezes”).
 */
let sharedController: AsymptoticProgressController | null = null;
const listeners = new Set<Tick>();

function broadcast(value: number, phase: AsymptoticProgressPhase) {
  for (const listener of listeners) {
    listener(value, phase);
  }
}

function ensureController(initialValue: number): AsymptoticProgressController {
  if (!sharedController) {
    sharedController = createAsymptoticProgress({ initialValue });
    sharedController.start(broadcast);
  }
  return sharedController;
}

function releaseController() {
  // Defer: no Strict Mode o cleanup roda antes do remount — não mata o singleton.
  queueMicrotask(() => {
    if (listeners.size > 0) {
      return;
    }
    sharedController?.stop();
    sharedController = null;
  });
}

export function useAsymptoticProgress(ready: boolean) {
  const seedRef = useRef<number | null>(null);
  if (seedRef.current == null) {
    seedRef.current = consumeBootSplashSeed();
  }

  const [progress, setProgress] = useState(() => seedRef.current ?? 0);
  const [phase, setPhase] = useState<AsymptoticProgressPhase>("booting");

  useEffect(() => {
    const controller = ensureController(seedRef.current ?? 0);
    const listener: Tick = (value, nextPhase) => {
      setProgress(value);
      setPhase(nextPhase);
    };
    listeners.add(listener);
    // Sync imediato (remount no meio do boot).
    setProgress(controller.value);
    setPhase(controller.phase);

    return () => {
      listeners.delete(listener);
      releaseController();
    };
  }, []);

  useEffect(() => {
    sharedController?.setReady(ready);
  }, [ready]);

  return {
    progress,
    phase,
    done: phase === "done",
    getCurrentProgress,
  };
}

function getCurrentProgress(): number {
  return sharedController?.value ?? 0;
}

/** Encerra o singleton (após splash done / logout). */
export function resetAsymptoticProgressSingleton(): void {
  sharedController?.stop();
  sharedController = null;
  listeners.clear();
}
