"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthBootSplash } from "@/components/auth/auth-boot-splash";
import { useAuth } from "@/providers/auth-provider";

/**
 * Splash global no boot da sessão em rotas `/app/*` (F5 e cold boot pós-login).
 * Login submit também monta splash; o progresso continua via sessionStorage.
 */
export function AuthBootSplashHost() {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const onApp = pathname.startsWith("/app");
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  const showRef = useRef(false);

  useEffect(() => {
    showRef.current = show;
  }, [show]);

  useEffect(() => {
    if (!onApp) {
      return;
    }

    if (isLoading) {
      setShow(true);
      setReady(false);
      return;
    }

    if (showRef.current) {
      setReady(true);
    }
  }, [isLoading, onApp]);

  if (!show) {
    return null;
  }

  return (
    <AuthBootSplash
      ready={ready}
      onFinished={() => {
        setShow(false);
        setReady(false);
      }}
    />
  );
}
