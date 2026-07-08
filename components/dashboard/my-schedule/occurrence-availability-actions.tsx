"use client";

import { Check, RotateCcw, X } from "lucide-react";

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
  layout?: "compact" | "default";
  className?: string;
  onRespond: (status: ScheduleAvailabilityAction) => void;
}

export function OccurrenceAvailabilityActions({
  availabilityStatus,
  needsRosterFunctions = false,
  ministryName = "este ministério",
  busy = false,
  layout = "default",
  className,
  onRespond,
}: OccurrenceAvailabilityActionsProps) {
  const theme = getAvailabilityTheme(
    needsRosterFunctions ? null : availabilityStatus,
  );
  const isAvailable = availabilityStatus === "available";
  const isUnavailable = availabilityStatus === "unavailable";

  function submitAvailable() {
    onRespond("available");
  }

  function submitUnavailable() {
    onRespond("unavailable");
  }

  function submitClear() {
    onRespond("clear");
  }

  const content = (
    <>
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
            disabled={busy}
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
            disabled={busy}
            className={cn(
              isUnavailable && theme.primaryButton,
              isAvailable && !isUnavailable && theme.secondaryButton,
            )}
            aria-pressed={isUnavailable}
            onClick={() =>
              isUnavailable ? submitClear() : submitUnavailable()
            }
          >
            <X className="size-4" />
            Não posso
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              variant={isAvailable ? "default" : "outline"}
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
              className="w-full text-muted-foreground"
              onClick={submitClear}
            >
              <RotateCcw className="size-4" />
              Limpar resposta
            </Button>
          ) : null}
        </>
      )}
    </>
  );

  if (layout === "compact") {
    return (
      <div
        className={cn(
          "space-y-2 rounded-xl border p-3",
          theme.shell,
          className,
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-2 rounded-xl border p-3", theme.shell, className)}
    >
      {content}
    </div>
  );
}
