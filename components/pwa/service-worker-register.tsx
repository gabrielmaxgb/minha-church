"use client";

import { useEffect } from "react";

/**
 * Registra o SW só em produção.
 * Em dev o HMR do Next/Turbopack e o SW brigam — nunca registrar localmente.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        // Sem skipWaiting automático: nova versão ativa no próximo ciclo de
        // navegação — evita trocar o shell no meio de um formulário.
        if (cancelled) {
          return;
        }
      } catch (error) {
        console.warn("[pwa] Falha ao registrar service worker:", error);
      }
    }

    void register();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
