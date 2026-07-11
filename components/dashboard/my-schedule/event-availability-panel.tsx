"use client";

import { Check, RotateCcw, X } from "lucide-react";

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
  busy?: boolean;
  layout?: "compact" | "default";
  className?: string;
  showHeader?: boolean;
  interactionsDisabled?: boolean;
  onRespond: (payload: EventAvailabilityPayload) => void;
}

export function EventAvailabilityPanel({
  availabilityStatus,
  availabilityMessage,
  needsRosterFunctions = false,
  ministryName = "este ministério",
  busy = false,
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
  const controlsDisabled = busy || interactionsDisabled;

  function submitAvailable() {
    onRespond({ status: "available", roleLabels: [] });
  }

  function submitUnavailable() {
    onRespond({ status: "unavailable", roleLabels: [] });
  }

  function submitClear() {
    onRespond({ status: "clear", roleLabels: [] });
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border p-4 sm:p-5",
        theme.shell,
        className,
      )}
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
        {needsRosterFunctions ? (
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
            onClick={() => (isAvailable ? submitClear() : submitAvailable())}
          >
            <Check className="size-4" />
            Posso
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
            disabled={controlsDisabled}
            onClick={() =>
              isUnavailable ? submitClear() : submitUnavailable()
            }
          >
            <X className="size-4" />
            Não posso
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
              onClick={() => (isAvailable ? submitClear() : submitAvailable())}
            >
              <Check className="size-3.5" />
              Posso ir
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
              onClick={() =>
                isUnavailable ? submitClear() : submitUnavailable()
              }
            >
              <X className="size-3.5" />
              Não posso
            </Button>
          </div>
          {availabilityStatus ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={controlsDisabled}
              className="w-full text-muted-foreground"
              onClick={submitClear}
            >
              <RotateCcw className="size-4" />
              Limpar resposta
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
