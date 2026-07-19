"use client";

import { useEffect } from "react";

/**
 * Registra o SW só em produção.
 * Em dev o HMR do Next/Turbopack e o SW brigam — nunca registrar localmente.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Em dev, remove qualquer SW residual (ex.: build de produção no mesmo
    // origin). HMR do Turbopack e SW cache-first brigam e causam hydration
    // mismatch com HTML fresco + JS antigo.
    if (process.env.NODE_ENV !== "production") {
      void (async () => {
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map((registration) => registration.unregister()),
          );
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(
              keys
                .filter(
                  (key) =>
                    key.startsWith("mc-shell-") || key.startsWith("mc-static-"),
                )
                .map((key) => caches.delete(key)),
            );
          }
        } catch (error) {
          console.warn("[pwa] Falha ao limpar service worker em dev:", error);
        }
      })();
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
