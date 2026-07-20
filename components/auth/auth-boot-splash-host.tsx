"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { AuthBootSplash } from "@/components/auth/auth-boot-splash";
import {
  clearBootSplashLive,
  clearBootSplashSeed,
  getBootSplashDefaultLabel,
  getBootSplashLiveState,
  setBootSplashReady,
  subscribeBootSplashLive,
} from "@/lib/auth/boot-splash-bridge";
import { useAuth } from "@/providers/auth-provider";

function useBootSplashLive() {
  return useSyncExternalStore(
    subscribeBootSplashLive,
    getBootSplashLiveState,
    getBootSplashLiveState,
  );
}

/**
 * Splash global única: login (via bridge) + boot de sessão em `/app/*`.
 * Evita remount da arte na troca de label — só o texto dá refresh.
 */
export function AuthBootSplashHost() {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const live = useBootSplashLive();
  const onApp = pathname.startsWith("/app");

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Login soft-nav: completa a splash quando a rota /app já está ativa.
  useEffect(() => {
    if (live.active && !live.ready && onApp) {
      setBootSplashReady();
    }
  }, [live.active, live.ready, onApp]);

  // Cold boot / F5 em /app.
  useEffect(() => {
    if (!onApp || live.active) {
      return;
    }

    if (isLoading) {
      setSessionActive(true);
      setSessionReady(false);
      return;
    }

    if (sessionActive) {
      setSessionReady(true);
    }
  }, [isLoading, onApp, sessionActive, live.active]);

  const showSession = onApp && !live.active && (isLoading || sessionActive);
  const show = live.active || showSession;

  if (!show) {
    return null;
  }

  const ready = live.active ? live.ready : sessionReady;
  const label = live.active ? live.label : getBootSplashDefaultLabel();

  return (
    <AuthBootSplash
      ready={ready}
      label={label}
      onFinished={() => {
        clearBootSplashLive();
        clearBootSplashSeed();
        setSessionActive(false);
        setSessionReady(false);
      }}
    />
  );
}
