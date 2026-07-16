"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, RotateCcw, X } from "lucide-react";

import { RosterFunctionsReminder } from "@/components/dashboard/ministries/roster-functions-reminder";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import { Button } from "@/components/ui/button";
import { getAvailabilityTheme } from "@/lib/my-schedule/availability-theme";
import type { ScheduleAvailabilityAction } from "@/lib/my-schedule/event-display";
import { cn } from "@/lib/utils";

export interface EventAvailabilityPayload {
  status: ScheduleAvailabilityAction;
  roleLabels: string[];
}

interface EventAvailabilityPanelProps {
  availabilityStatus: "available" | "unavailable" | null;
  availabilityMessage?: string | null;
  needsRosterFunctions?: boolean;
  ministryName?: string;
  /** This panel is currently saving a response. */
  busy?: boolean;
  /** Disable controls without showing a saving state (e.g. another event is saving). */
  disabled?: boolean;
  layout?: "compact" | "default";
  className?: string;
  showHeader?: boolean;
  interactionsDisabled?: boolean;
  onRespond: (payload: EventAvailabilityPayload) => void;
}

function ActionLabel({
  busy,
  pending,
  idleLabel,
}: {
  busy: boolean;
  pending: boolean;
  idleLabel: string;
}) {
  if (busy && pending) {
    return "Salvando...";
  }
  return idleLabel;
}

export function EventAvailabilityPanel({
  availabilityStatus,
  availabilityMessage,
  needsRosterFunctions = false,
  ministryName = "este ministério",
  busy = false,
  disabled = false,
  layout = "default",
  className,
  showHeader = false,
  interactionsDisabled = false,
  onRespond,
}: EventAvailabilityPanelProps) {
  const theme = getAvailabilityTheme(
    needsRosterFunctions ? null : availabilityStatus,
  );
  const isAvailable = availabilityStatus === "available";
  const isUnavailable = availabilityStatus === "unavailable";
  const controlsDisabled = busy || disabled || interactionsDisabled;
  const [pendingAction, setPendingAction] =
    useState<ScheduleAvailabilityAction | null>(null);

  useEffect(() => {
    if (!busy) {
      setPendingAction(null);
    }
  }, [busy]);

  function submit(status: ScheduleAvailabilityAction) {
    setPendingAction(status);
    onRespond({ status, roleLabels: [] });
  }

  const pendingAvailable =
    pendingAction === "available" ||
    (pendingAction === "clear" && isAvailable);
  const pendingUnavailable =
    pendingAction === "unavailable" ||
    (pendingAction === "clear" && isUnavailable);

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border p-4 sm:p-5 transition-opacity",
        theme.shell,
        busy && "ring-1 ring-foreground/10",
        className,
      )}
      aria-busy={busy || undefined}
    >
      {showHeader ? (
        <div className="space-y-1 border-b border-current/10 pb-3">
          <h3 className="text-sm font-semibold tracking-tight">
            Você pode ir?
          </h3>
          <p className="text-sm text-muted-foreground">
            A coleta está aberta. Informe se pode servir neste dia.
          </p>
        </div>
      ) : null}

      {interactionsDisabled ? (
        <LockedFeatureHint action="marcar disponibilidade em escalas" />
      ) : null}

      <div className={cn("space-y-0.5", theme.statusTone)} role="status">
        {busy ? (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
              Salvando resposta...
            </p>
            <p className={cn("text-xs", theme.statusHintTone)}>
              Aguarde um instante.
            </p>
          </>
        ) : needsRosterFunctions ? (
          <>
            <p className="text-sm font-semibold">Funções não configuradas</p>
            <p className={cn("text-xs", theme.statusHintTone)}>
              Cadastre suas funções no perfil antes de responder.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">{theme.statusTitle}</p>
            <p className={cn("text-xs", theme.statusHintTone)}>
              {theme.statusHint}
            </p>
          </>
        )}
      </div>

      {availabilityMessage?.trim() ? (
        <div
          className={cn(
            "rounded-xl border px-3 py-2.5 text-sm leading-relaxed text-foreground",
            theme.messageBox,
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              theme.messageLabel,
            )}
          >
            Mensagem do líder
          </p>
          <p className="mt-1 whitespace-pre-wrap">{availabilityMessage.trim()}</p>
        </div>
      ) : null}

      {needsRosterFunctions ? (
        <RosterFunctionsReminder
          ministryId=""
          ministryName={ministryName}
          compact
        />
      ) : layout === "compact" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={isAvailable ? "default" : "outline"}
            disabled={controlsDisabled}
            className={cn(
              isAvailable && theme.primaryButton,
              isUnavailable && !isAvailable && theme.secondaryButton,
            )}
            aria-pressed={isAvailable}
            aria-busy={(busy && pendingAvailable) || undefined}
            onClick={() =>
              submit(isAvailable ? "clear" : "available")
            }
          >
            {busy && pendingAvailable ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
            <ActionLabel
              busy={busy}
              pending={pendingAvailable}
              idleLabel="Posso"
            />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isUnavailable ? "destructive" : "outline"}
            className={cn(
              isUnavailable && theme.primaryButton,
              isAvailable && !isUnavailable && theme.secondaryButton,
            )}
            aria-pressed={isUnavailable}
            aria-busy={(busy && pendingUnavailable) || undefined}
            disabled={controlsDisabled}
            onClick={() =>
              submit(isUnavailable ? "clear" : "unavailable")
            }
          >
            {busy && pendingUnavailable ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <X className="size-4" aria-hidden />
            )}
            <ActionLabel
              busy={busy}
              pending={pendingUnavailable}
              idleLabel="Não posso"
            />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              variant={isAvailable ? "default" : "outline"}
              disabled={controlsDisabled}
              className={cn(
                "h-9",
                isAvailable && theme.primaryButton,
                isUnavailable && !isAvailable && theme.secondaryButton,
              )}
              aria-pressed={isAvailable}
              aria-busy={(busy && pendingAction === "available") || undefined}
              onClick={() =>
                submit(isAvailable ? "clear" : "available")
              }
            >
              {busy && pendingAction === "available" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Check className="size-3.5" aria-hidden />
              )}
              <ActionLabel
                busy={busy}
                pending={pendingAction === "available"}
                idleLabel="Posso ir"
              />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={isUnavailable ? "destructive" : "outline"}
              disabled={controlsDisabled}
              className={cn(
                "h-9",
                isUnavailable && theme.primaryButton,
                isAvailable && !isUnavailable && theme.secondaryButton,
              )}
              aria-pressed={isUnavailable}
              aria-busy={
                (busy && pendingAction === "unavailable") || undefined
              }
              onClick={() =>
                submit(isUnavailable ? "clear" : "unavailable")
              }
            >
              {busy && pendingAction === "unavailable" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <X className="size-3.5" aria-hidden />
              )}
              <ActionLabel
                busy={busy}
                pending={pendingAction === "unavailable"}
                idleLabel="Não posso"
              />
            </Button>
          </div>
          {availabilityStatus ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={controlsDisabled}
              className="w-full text-muted-foreground"
              aria-busy={(busy && pendingAction === "clear") || undefined}
              onClick={() => submit("clear")}
            >
              {busy && pendingAction === "clear" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RotateCcw className="size-4" aria-hidden />
              )}
              {busy && pendingAction === "clear"
                ? "Limpando..."
                : "Limpar resposta"}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
