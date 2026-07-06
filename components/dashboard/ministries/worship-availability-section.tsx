"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CircleDashed,
  Repeat,
} from "lucide-react";

import { RosterCollectionPanel } from "@/components/dashboard/ministries/roster-collection-panel";
import {
  AvailabilityRespondActions,
} from "@/components/dashboard/my-schedule/availability-respond-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { activityDetailPath } from "@/constants/routes";
import { formatEventTime } from "@/lib/dashboard/date-utils";
import {
  useUpdateEventAvailability,
  useWorshipProfile,
} from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import type {
  WorshipAvailabilityEvent,
  WorshipSeriesGroup,
} from "@/types/ministries";

interface WorshipAvailabilitySectionProps {
  ministryId: string;
  canManage?: boolean;
  canManageRosters?: boolean;
}

function formatEventDay(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

function SeriesCard({
  group,
  busyEventId,
  onSetStatus,
  canManageRosters = false,
}: {
  group: WorshipSeriesGroup;
  busyEventId: string | null;
  onSetStatus: (
    eventId: string,
    status: "available" | "unavailable" | "clear",
  ) => void;
  canManageRosters?: boolean;
}) {
  const [open, setOpen] = useState(group.myPendingCount > 0);
  const openOccurrences = group.occurrences.filter((item) => item.rosterOpen);
  const firstOpen = openOccurrences[0] ?? group.occurrences[0];
  const timeLabel = firstOpen ? formatEventTime(firstOpen.startsAt) : "";

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30 sm:px-5"
      >
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        >
          <ChevronDown className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-semibold tracking-tight">
              {group.name}
            </span>
            {group.isRecurring && (
              <Badge variant="secondary" className="gap-1">
                <Repeat className="size-3" />
                Recorrente
              </Badge>
            )}
          </span>

          <span className="mt-1 block text-sm text-muted-foreground">
            {group.occurrences.length} data
            {group.occurrences.length === 1 ? "" : "s"} futura
            {group.occurrences.length === 1 ? "" : "s"}
            {timeLabel ? ` · ${timeLabel}` : ""}
            {group.openCount > 0
              ? ` · ${group.openCount} aberta${group.openCount === 1 ? "" : "s"} para marcar`
              : " · aguardando liberação"}
          </span>

          {group.openCount > 0 && (
            <span className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-800 dark:text-emerald-300">
                {group.myAvailableCount} posso ir
              </span>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
                {group.myUnavailableCount} não posso
              </span>
              {group.myPendingCount > 0 && (
                <span className="rounded-full bg-attention-subtle px-2 py-0.5 font-medium text-attention-foreground">
                  {group.myPendingCount} sem resposta
                </span>
              )}
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-border/60 bg-muted/10 px-4 py-4 sm:px-5">
          <p className="text-xs text-muted-foreground">
            Marque cada data em que você pode servir nesta série.
          </p>

          {group.occurrences.map((event) => (
            <OccurrenceRow
              key={event.id}
              event={event}
              busy={busyEventId === event.id}
              onSetStatus={onSetStatus}
              canManageRosters={canManageRosters}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function OccurrenceRow({
  event,
  busy,
  onSetStatus,
  canManageRosters = false,
}: {
  event: WorshipAvailabilityEvent;
  busy: boolean;
  onSetStatus: (
    eventId: string,
    status: "available" | "unavailable" | "clear",
  ) => void;
  canManageRosters?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
        event.myStatus === "available" &&
          "border-emerald-500/25 bg-emerald-500/5",
        event.myStatus === "unavailable" &&
          "border-destructive/20 bg-destructive/4",
        !event.myStatus && "border-border/70 bg-background",
        !event.rosterOpen && "opacity-80",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium capitalize text-foreground">
          {formatEventDay(event.startsAt)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatEventTime(event.startsAt)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </div>

      {event.rosterOpen ? (
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <AvailabilityRespondActions
            busy={busy}
            layout="compact"
            availabilityStatus={event.myStatus}
            onRespond={(status) => onSetStatus(event.id, status)}
          />
          {canManageRosters && (
            <Button size="sm" variant="outline" asChild>
              <Link href={activityDetailPath(event.id)}>Montar escala</Link>
            </Button>
          )}
        </div>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CircleDashed className="size-3.5" />
          Ainda não liberado
        </span>
      )}
    </div>
  );
}

export function WorshipAvailabilitySection({
  ministryId,
  canManage = false,
  canManageRosters = false,
}: WorshipAvailabilitySectionProps) {
  const { data, isLoading, isError, error } = useWorshipProfile(ministryId);
  const updateAvailability = useUpdateEventAvailability(ministryId);
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStatus(
    eventId: string,
    status: "available" | "unavailable" | "clear",
  ) {
    setActionError(null);
    setBusyEventId(eventId);

    try {
      await updateAvailability.mutateAsync({ eventId, status });
    } catch (statusError) {
      setActionError(
        statusError instanceof Error
          ? statusError.message
          : "Não foi possível atualizar sua disponibilidade.",
      );
    } finally {
      setBusyEventId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
        {error instanceof Error
          ? error.message
          : "Disponibilidade disponível apenas para quem faz parte deste ministério."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RosterCollectionPanel
        ministryId={ministryId}
        canManage={canManage}
        openEventsCount={data.summary.totalOpen}
      />

      {actionError && (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {actionError}
        </p>
      )}

      {data.summary.totalOpen > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2.5">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Posso ir
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {data.summary.available}
            </p>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5">
            <p className="text-xs font-medium text-destructive">Não posso</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {data.summary.unavailable}
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2.5">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Sem resposta
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {data.summary.pending}
            </p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Séries e eventos
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Toque em uma série para abrir as datas e marcar sua disponibilidade.
          </p>
        </div>

        {!data.series.length ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-5 py-10 text-center">
            <CalendarDays className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">
              Nenhum evento com escala cadastrado
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Crie atividades com &quot;Este evento usa escala&quot; para a equipe
              poder marcar disponibilidade.
            </p>
          </div>
        ) : (
          data.series.map((group) => (
            <SeriesCard
              key={group.key}
              group={group}
              busyEventId={busyEventId}
              onSetStatus={(eventId, status) =>
                void handleStatus(eventId, status)
              }
              canManageRosters={canManageRosters}
            />
          ))
        )}
      </section>
    </div>
  );
}
