"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  isDismissedRecently,
  isIosDevice,
  isStandaloneDisplay,
  markInstallDismissed,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install";
import { cn } from "@/lib/utils";

/** Espera o painel assentar (onboarding/trial) antes de oferecer instalação. */
const SHOW_DELAY_MS = 10_000;

/**
 * Prompt de instalação — só no dashboard autenticado.
 * Android/Chrome: beforeinstallprompt. iOS: dica de “Adicionar à Tela de Início”.
 * Visual alinhado à floating save bar (quiet, acima da bottom nav).
 */
export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"native" | "ios" | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isStandaloneDisplay() || isDismissedRecently()) {
      return;
    }

    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    function scheduleShow(next: "native" | "ios") {
      if (showTimer) clearTimeout(showTimer);
      showTimer = setTimeout(() => {
        if (isStandaloneDisplay() || isDismissedRecently()) {
          return;
        }
        // Não disputa espaço com a barra de salvar alterações.
        if (document.body.dataset.floatingSaveBar === "true") {
          return;
        }
        setMode(next);
        setVisible(true);
      }, SHOW_DELAY_MS);
    }

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      deferredPrompt = event as BeforeInstallPromptEvent;
      setDeferred(deferredPrompt);
      scheduleShow("native");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS Safari: sem beforeinstallprompt — oferta educativa só em mobile.
    if (isIosDevice() && window.matchMedia("(max-width: 1023px)").matches) {
      scheduleShow("ios");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (showTimer) clearTimeout(showTimer);
    };
  }, []);

  function dismiss() {
    markInstallDismissed();
    setVisible(false);
    setDeferred(null);
  }

  async function handleInstall() {
    if (!deferred) {
      return;
    }

    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // user closed sheet — fine
    } finally {
      setInstalling(false);
      markInstallDismissed();
      setVisible(false);
      setDeferred(null);
    }
  }

  if (!visible || !mode) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[35] flex justify-center p-3 sm:p-4",
        "bottom-[var(--mobile-nav-offset,0px)] lg:bottom-0",
      )}
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <div
        className={cn(
          "pointer-events-auto relative flex w-full max-w-lg gap-3 rounded-2xl border border-border/80 bg-card p-4 pt-4 shadow-elevated",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
        )}
      >
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          {mode === "ios" ? (
            <Share className="size-4" aria-hidden />
          ) : (
            <Download className="size-4" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="pr-8">
            <p
              id="pwa-install-title"
              className="text-sm font-semibold text-foreground"
            >
              {mode === "ios"
                ? "Adicione à tela inicial"
                : "Abrir como app"}
            </p>
            <p
              id="pwa-install-desc"
              className="mt-1 text-sm leading-relaxed text-muted-foreground"
            >
              {mode === "ios" ? (
                <>
                  No Safari: Compartilhar → Adicionar à Tela de Início. Veja o
                  passo a passo completo.
                </>
              ) : (
                <>
                  Instale o Minha Church na tela inicial — acesso rápido, sem
                  loja.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mode === "native" ? (
              <Button
                type="button"
                size="sm"
                disabled={installing}
                onClick={() => void handleInstall()}
              >
                {installing ? "Abrindo…" : "Instalar"}
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href={AUTH_ROUTES.installApp} onClick={dismiss}>
                  Ver como instalar
                </Link>
              </Button>
            )}
            {mode === "native" ? (
              <Button asChild size="sm" variant="ghost">
                <Link href={AUTH_ROUTES.installApp} onClick={dismiss}>
                  Saiba mais
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant={mode === "native" ? "ghost" : "outline"}
              onClick={dismiss}
            >
              Agora não
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2.5 top-2.5 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
