"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Check,
  Download,
  MoreVertical,
  Share,
  Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  isIosDevice,
  isStandaloneDisplay,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install";
import { cn } from "@/lib/utils";

const BENEFITS = [
  "Abra em um toque, direto da tela inicial",
  "Sensação de app, sem baixar na loja",
  "Continua funcionando no navegador se preferir",
] as const;

export function PwaInstallGuide({ className }: { className?: string }) {
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneDisplay());
    setIsIos(isIosDevice());

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferred) {
      return;
    }

    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // user closed the sheet
    } finally {
      setInstalling(false);
      setDeferred(null);
      if (isStandaloneDisplay()) {
        setInstalled(true);
      }
    }
  }, [deferred]);

  if (installed) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="rounded-2xl border border-border/80 bg-muted/30 px-5 py-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-5" aria-hidden />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            App já instalado
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Você está usando o Minha Church pela tela inicial. Pode fechar esta
            página e seguir no painel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      <section className="space-y-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Smartphone className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-balance">
            Use o Minha Church como app
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            Instale um atalho na tela inicial — rápido, sem App Store e sem
            Google Play.
          </p>
        </div>
        <ul className="space-y-2.5 pt-1">
          {BENEFITS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm leading-snug text-foreground"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold tracking-tight">
          {isIos ? "No iPhone (Safari)" : "No Android (Chrome)"}
        </h3>

        {isIos ? (
          <ol className="space-y-3">
            <Step
              n={1}
              icon={<Share className="size-4" aria-hidden />}
              title="Toque em Compartilhar"
              description="O ícone de compartilhar fica na barra do Safari (embaixo ou em cima, conforme o modelo)."
            />
            <Step
              n={2}
              title="Adicionar à Tela de Início"
              description="Role a lista de ações e escolha essa opção."
            />
            <Step
              n={3}
              title="Confirme em Adicionar"
              description="O ícone do Minha Church aparece na tela inicial, como um app."
            />
          </ol>
        ) : (
          <div className="space-y-4">
            {deferred ? (
              <Button
                type="button"
                className="w-full"
                disabled={installing}
                onClick={() => void handleInstall()}
              >
                <Download className="size-4" aria-hidden />
                {installing ? "Abrindo…" : "Instalar agora"}
              </Button>
            ) : null}

            <ol className="space-y-3">
              {deferred ? (
                <Step
                  n={1}
                  icon={<Download className="size-4" aria-hidden />}
                  title="Toque em Instalar agora"
                  description="O Chrome abre a confirmação do sistema. Aceite para criar o atalho."
                />
              ) : (
                <>
                  <Step
                    n={1}
                    icon={<MoreVertical className="size-4" aria-hidden />}
                    title="Abra o menu do Chrome"
                    description="Toque nos três pontinhos no canto superior direito."
                  />
                  <Step
                    n={2}
                    title="Instalar app / Adicionar à tela inicial"
                    description="O texto pode variar um pouco conforme a versão do Chrome."
                  />
                  <Step
                    n={3}
                    title="Confirme a instalação"
                    description="Pronto — o ícone fica na tela inicial."
                  />
                </>
              )}
            </ol>
          </div>
        )}
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Precisa estar no navegador do celular (Safari no iPhone, Chrome no
        Android). Se já instalou, abra pelo ícone da tela inicial.
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  description,
  icon,
}: {
  n: number;
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-xs font-semibold tabular-nums text-foreground shadow-sm">
        {icon ?? n}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </li>
  );
}
