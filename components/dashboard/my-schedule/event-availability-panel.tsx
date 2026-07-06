"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  addRosterRole,
  formatRosterRole,
  isRosterRoleSelected,
  removeRosterRole,
} from "@/lib/ministries/roster";
import type { ScheduleAvailabilityAction } from "@/lib/my-schedule/event-display";
import { cn } from "@/lib/utils";

export interface EventAvailabilityPayload {
  status: ScheduleAvailabilityAction;
  roleLabels: string[];
}

interface EventAvailabilityPanelProps {
  rosterRoles: string[];
  myRoleLabels: string[];
  availabilityStatus: "available" | "unavailable" | null;
  availabilityMessage?: string | null;
  busy?: boolean;
  layout?: "compact" | "default";
  className?: string;
  onRespond: (payload: EventAvailabilityPayload) => void;
}

export function EventAvailabilityPanel({
  rosterRoles,
  myRoleLabels,
  availabilityStatus,
  availabilityMessage,
  busy = false,
  layout = "default",
  className,
  onRespond,
}: EventAvailabilityPanelProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(myRoleLabels);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRoles(myRoleLabels);
    setRoleError(null);
  }, [myRoleLabels.join("|"), availabilityStatus]);

  const isAvailable = availabilityStatus === "available";
  const isUnavailable = availabilityStatus === "unavailable";
  const hasEventRoles = rosterRoles.length > 0;

  function toggleRole(role: string) {
    setRoleError(null);
    setSelectedRoles((current) =>
      isRosterRoleSelected(current, role)
        ? removeRosterRole(current, role)
        : addRosterRole(current, role),
    );
  }

  function submitAvailable() {
    if (!hasEventRoles) {
      setRoleError("O líder ainda não definiu as funções deste evento.");
      return;
    }

    if (selectedRoles.length === 0) {
      setRoleError("Selecione pelo menos uma função deste evento.");
      return;
    }

    onRespond({ status: "available", roleLabels: selectedRoles });
  }

  function submitUnavailable() {
    onRespond({ status: "unavailable", roleLabels: [] });
  }

  function submitClear() {
    onRespond({ status: "clear", roleLabels: [] });
  }

  return (
    <div className={cn("space-y-3", className)}>
      {availabilityMessage?.trim() ? (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/8 px-3 py-2.5 text-sm leading-relaxed text-foreground">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
            Mensagem do líder
          </p>
          <p className="mt-1 whitespace-pre-wrap">{availabilityMessage.trim()}</p>
        </div>
      ) : null}

      {hasEventRoles ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Precisamos das seguintes funções para servir neste ministério,
            pode nos ajudar em alguma delas?
          </p>
          <div className="flex flex-wrap gap-2">
            {rosterRoles.map((role) => {
              const active = isRosterRoleSelected(selectedRoles, role);

              return (
                <button
                  key={role}
                  type="button"
                  disabled={busy}
                  onClick={() => toggleRole(role)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {formatRosterRole(role)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
          O líder ainda não definiu as funções deste evento.
        </p>
      )}

      {roleError && (
        <p className="text-xs text-destructive">{roleError}</p>
      )}

      {layout === "compact" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={isAvailable ? "default" : "outline"}
            disabled={busy || !hasEventRoles}
            className={cn(
              isAvailable && "bg-emerald-600 hover:bg-emerald-600/90",
            )}
            onClick={() =>
              isAvailable ? submitClear() : submitAvailable()
            }
          >
            <Check className="size-4" />
            Posso
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isUnavailable ? "destructive" : "outline"}
            disabled={busy}
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
              disabled={busy || isAvailable || !hasEventRoles}
              className="h-9 bg-emerald-600 hover:bg-emerald-600/90"
              onClick={submitAvailable}
            >
              <Check className="size-3.5" />
              Posso ir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy || isUnavailable}
              className="h-9"
              onClick={submitUnavailable}
            >
              <X className="size-3.5" />
              Não posso
            </Button>
          </div>
          {availabilityStatus && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              className="w-full text-muted-foreground"
              onClick={submitClear}
            >
              <RotateCcw className="size-4" />
              Desfazer resposta
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
