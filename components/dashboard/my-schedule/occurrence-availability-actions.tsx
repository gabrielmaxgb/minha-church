"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, RotateCcw, X } from "lucide-react";

import { RosterFunctionsReminder } from "@/components/dashboard/ministries/roster-functions-reminder";
import { Button } from "@/components/ui/button";
import { getAvailabilityTheme } from "@/lib/my-schedule/availability-theme";
import type { ScheduleAvailabilityAction } from "@/lib/my-schedule/event-display";
import { cn } from "@/lib/utils";

interface OccurrenceAvailabilityActionsProps {
  availabilityStatus: "available" | "unavailable" | null;
  needsRosterFunctions?: boolean;
  ministryName?: string;
  busy?: boolean;
  disabled?: boolean;
  layout?: "compact" | "default";
  className?: string;
  onRespond: (status: ScheduleAvailabilityAction) => void;
}

export function OccurrenceAvailabilityActions({
  availabilityStatus,
  needsRosterFunctions = false,
  ministryName = "este ministério",
  busy = false,
  disabled = false,
  layout = "default",
  className,
  onRespond,
}: OccurrenceAvailabilityActionsProps) {
  const theme = getAvailabilityTheme(
    needsRosterFunctions ? null : availabilityStatus,
  );
  const isAvailable = availabilityStatus === "available";
  const isUnavailable = availabilityStatus === "unavailable";
  const controlsDisabled = busy || disabled;
  const [pendingAction, setPendingAction] =
    useState<ScheduleAvailabilityAction | null>(null);

  useEffect(() => {
    if (!busy) {
      setPendingAction(null);
    }
  }, [busy]);

  function submit(status: ScheduleAvailabilityAction) {
    setPendingAction(status);
    onRespond(status);
  }

  const pendingAvailable =
    pendingAction === "available" ||
    (pendingAction === "clear" && isAvailable);
  const pendingUnavailable =
    pendingAction === "unavailable" ||
    (pendingAction === "clear" && isUnavailable);

  const content = (
    <>
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
            onClick={() => submit(isAvailable ? "clear" : "available")}
          >
            {busy && pendingAvailable ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
            {busy && pendingAvailable ? "Salvando..." : "Posso"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isUnavailable ? "destructive" : "outline"}
            disabled={controlsDisabled}
            className={cn(
              isUnavailable && theme.primaryButton,
              isAvailable && !isUnavailable && theme.secondaryButton,
            )}
            aria-pressed={isUnavailable}
            aria-busy={(busy && pendingUnavailable) || undefined}
            onClick={() => submit(isUnavailable ? "clear" : "unavailable")}
          >
            {busy && pendingUnavailable ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <X className="size-4" aria-hidden />
            )}
            {busy && pendingUnavailable ? "Salvando..." : "Não posso"}
          </Button>
        </div>
      ) : (
        <>
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
              onClick={() => submit(isAvailable ? "clear" : "available")}
            >
              {busy && pendingAction === "available" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Check className="size-3.5" aria-hidden />
              )}
              {busy && pendingAction === "available"
                ? "Salvando..."
                : "Posso ir"}
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
              onClick={() => submit(isUnavailable ? "clear" : "unavailable")}
            >
              {busy && pendingAction === "unavailable" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <X className="size-3.5" aria-hidden />
              )}
              {busy && pendingAction === "unavailable"
                ? "Salvando..."
                : "Não posso"}
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
        </>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border p-3",
        theme.shell,
        busy && "ring-1 ring-foreground/10",
        className,
      )}
      aria-busy={busy || undefined}
    >
      {content}
    </div>
  );
}
