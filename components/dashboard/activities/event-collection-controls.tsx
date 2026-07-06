"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";

import { EventMutationScopeFields } from "@/components/dashboard/activities/event-mutation-scope-fields";
import { Button } from "@/components/ui/button";
import { formatEventTime } from "@/lib/dashboard/date-utils";
import { cn } from "@/lib/utils";
import type { ChurchEvent, EventMutationScope } from "@/types/events";

function formatEventDay(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

function isFutureEvent(startsAt: string): boolean {
  return new Date(startsAt).getTime() >= Date.now();
}

function resolveCollectionTargets(
  event: ChurchEvent,
  seriesOccurrences: ChurchEvent[],
  scope: EventMutationScope,
): ChurchEvent[] {
  const eligible = (occurrence: ChurchEvent) =>
    occurrence.usesRoster && isFutureEvent(occurrence.startsAt);

  if (!event.recurrence) {
    return eligible(event) ? [event] : [];
  }

  const anchorTime = new Date(event.startsAt).getTime();
  const inSeries =
    seriesOccurrences.length > 0 ? seriesOccurrences : [event];

  let targets: ChurchEvent[];

  switch (scope) {
    case "this":
      targets = [event];
      break;
    case "this_and_following":
      targets = inSeries.filter(
        (occurrence) => new Date(occurrence.startsAt).getTime() >= anchorTime,
      );
      break;
    case "all":
      targets = inSeries;
      break;
    default:
      targets = [event];
  }

  return targets.filter(eligible);
}

interface EventCollectionControlsProps {
  event: ChurchEvent;
  seriesOccurrences: ChurchEvent[];
  busy?: boolean;
  onApply: (rosterOpen: boolean, eventIds: string[]) => void;
  className?: string;
  /** Sem cabeçalho próprio — usado dentro do passo 2 do fluxo */
  embedded?: boolean;
}

export function EventCollectionControls({
  event,
  seriesOccurrences,
  busy = false,
  onApply,
  className,
  embedded = false,
}: EventCollectionControlsProps) {
  const isRecurring = Boolean(event.recurrence);
  const [scope, setScope] = useState<EventMutationScope>("this");

  const targets = useMemo(
    () => resolveCollectionTargets(event, seriesOccurrences, scope),
    [event, seriesOccurrences, scope],
  );

  const resolvedIds = useMemo(() => targets.map((item) => item.id), [targets]);

  if (!event.usesRoster && !seriesOccurrences.some((item) => item.usesRoster)) {
    return null;
  }

  const scopeSummary =
    scope === "this"
      ? "somente esta data"
      : scope === "this_and_following"
        ? "esta e as próximas"
        : "toda a série";

  return (
    <div className={cn("space-y-4", className)}>
      {!embedded && (
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <CalendarCheck className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Coleta de disponibilidade
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Libere ou feche a coleta para a equipe marcar se pode ajudar neste
              evento.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Data em foco
        </p>
        <p className="mt-1 text-sm font-medium capitalize text-foreground">
          {formatEventDay(event.startsAt)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatEventTime(event.startsAt)}
          {event.rosterOpen ? (
            <span className="ml-2 font-medium text-emerald-700">· coleta aberta</span>
          ) : (
            <span className="ml-2 text-muted-foreground">· coleta fechada</span>
          )}
        </p>
      </div>

      {isRecurring && (
        <EventMutationScopeFields
          name={`collection-scope-${event.id}`}
          value={scope}
          onChange={setScope}
          disabled={busy}
          actionLabel="collection"
        />
      )}

      {resolvedIds.length > 0 && isRecurring && (
        <p className="text-xs text-muted-foreground">
          {resolvedIds.length === 1
            ? "1 data futura afetada"
            : `${resolvedIds.length} datas futuras afetadas`}{" "}
          ({scopeSummary}).
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="flex-1"
          disabled={busy || resolvedIds.length === 0}
          onClick={() => onApply(true, resolvedIds)}
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Abrindo...
            </>
          ) : (
            `Abrir coleta${isRecurring ? ` (${resolvedIds.length})` : ""}`
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={busy || resolvedIds.length === 0}
          onClick={() => onApply(false, resolvedIds)}
        >
          {busy ? "Fechando..." : "Fechar coleta"}
        </Button>
      </div>

      {resolvedIds.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Nenhuma data futura com escala neste alcance.
        </p>
      )}
    </div>
  );
}

export function formatOccurrenceScheduleLine(event: ChurchEvent): string {
  return `${formatEventDay(event.startsAt)} · ${formatEventTime(event.startsAt)}`;
}
