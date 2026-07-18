"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchPushStatus } from "@/lib/api/push";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  disableWebPush,
  enableWebPush,
  getPushSupport,
} from "@/lib/pwa/web-push";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type Status =
  | "loading"
  | "unsupported"
  | "ios-install"
  | "not-configured"
  | "off"
  | "on"
  | "busy";

export function PushNotificationsPanel({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const support = getPushSupport();
    if (!support.ok) {
      if (support.reason === "ios-not-standalone") {
        setStatus("ios-install");
        setMessage(support.message);
      } else {
        setStatus("unsupported");
        setMessage(support.message);
      }
      return;
    }

    try {
      const remote = await fetchPushStatus();
      if (!remote.configured) {
        setStatus("not-configured");
        setMessage(
          "Push ainda não está configurado neste ambiente (chaves VAPID).",
        );
        return;
      }

      const permission =
        typeof Notification !== "undefined" ? Notification.permission : "default";
      if (remote.enabled && permission === "granted") {
        setStatus("on");
        setMessage("Avisos do sino também chegam no celular.");
      } else {
        setStatus("off");
        setMessage(
          "Receba escala, inscrição e outros avisos do inbox mesmo com o app fechado.",
        );
      }
    } catch (err) {
      setStatus("unsupported");
      setMessage(
        err instanceof ApiError
          ? err.message
          : "Não foi possível verificar o status do push.",
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleEnable = async () => {
    setError(null);
    setStatus("busy");
    try {
      await enableWebPush();
      setStatus("on");
      setMessage("Avisos do sino também chegam no celular.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao ativar push.");
      await refresh();
    }
  };

  const handleDisable = async () => {
    setError(null);
    setStatus("busy");
    try {
      await disableWebPush();
      setStatus("off");
      setMessage(
        "Receba escala, inscrição e outros avisos do inbox mesmo com o app fechado.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao desativar push.");
      await refresh();
    }
  };

  if (status === "loading") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Verificando notificações…
      </div>
    );
  }

  if (status === "unsupported" || status === "not-configured") {
    if (compact) {
      return null;
    }

    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {message}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card px-4 py-4 sm:px-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          {status === "on" ? (
            <Bell className="size-4" aria-hidden />
          ) : (
            <BellOff className="size-4" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Notificações no celular
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {message}
            </p>
          </div>

          {status === "ios-install" ? (
            <Button asChild size="sm" variant="outline">
              <Link href={AUTH_ROUTES.installApp}>Instalar app</Link>
            </Button>
          ) : null}

          {status === "off" ? (
            <Button size="sm" onClick={() => void handleEnable()}>
              Ativar notificações
            </Button>
          ) : null}

          {status === "on" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleDisable()}
            >
              Desativar
            </Button>
          ) : null}

          {status === "busy" ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Aguarde…
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
