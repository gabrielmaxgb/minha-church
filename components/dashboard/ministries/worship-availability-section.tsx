"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CircleDashed,
  ClipboardList,
  Repeat,
} from "lucide-react";

import { WorshipAvailabilityWindowPanel } from "@/components/dashboard/ministries/worship-availability-window-panel";
import { RosterFunctionsEditor } from "@/components/dashboard/ministries/roster-functions-editor";
import { RosterFunctionsReminder } from "@/components/dashboard/ministries/roster-functions-reminder";
import {
  AvailabilityRespondActions,
} from "@/components/dashboard/my-schedule/availability-respond-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { activityDetailPath, ROSTER_PROFILE_SECTION_ID } from "@/constants/routes";
import {
  hasRosterProfileHash,
  scrollToRosterProfileSection,
} from "@/lib/ministries/roster-profile-scroll";
import { formatEventTime } from "@/lib/dashboard/date-utils";
import {
  normalizeRosterRoleList,
  needsRosterFunctions,
  rosterRolesEqual,
} from "@/lib/ministries/roster";
import {
  useUpdateEventAvailability,
  useUpdateWorshipProfile,
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
  needsRosterFunctions = false,
  ministryId,
}: {
  group: WorshipSeriesGroup;
  busyEventId: string | null;
  onSetStatus: (
    eventId: string,
    status: "available" | "unavailable" | "clear",
  ) => void;
  canManageRosters?: boolean;
  needsRosterFunctions?: boolean;
  ministryId: string;
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
              needsRosterFunctions={needsRosterFunctions}
              ministryId={ministryId}
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
  needsRosterFunctions = false,
  ministryId,
}: {
  event: WorshipAvailabilityEvent;
  busy: boolean;
  onSetStatus: (
    eventId: string,
    status: "available" | "unavailable" | "clear",
  ) => void;
  canManageRosters?: boolean;
  needsRosterFunctions?: boolean;
  ministryId: string;
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
            ministryId={ministryId}
            needsRosterFunctions={needsRosterFunctions}
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
  const updateProfile = useUpdateWorshipProfile(ministryId);
  const updateAvailability = useUpdateEventAvailability(ministryId);
  const [functionsDraft, setFunctionsDraft] = useState<string[] | null>(null);
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const rosterFunctions = functionsDraft ?? data?.instruments ?? [];
  const showFunctionsReminder = needsRosterFunctions(rosterFunctions);

  const functionsDirty = useMemo(() => {
    if (!data || functionsDraft === null) {
      return false;
    }

    return !rosterRolesEqual(functionsDraft, data.instruments);
  }, [data, functionsDraft]);

  function discardFunctions() {
    setFunctionsDraft(null);
    setActionError(null);
  }

  async function saveFunctions() {
    setActionError(null);

    try {
      await updateProfile.mutateAsync(normalizeRosterRoleList(rosterFunctions));
      setFunctionsDraft(null);
    } catch (saveError) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar suas funções.",
      );
    }
  }

  async function handleStatus(
    eventId: string,
    status: "available" | "unavailable" | "clear",
  ) {
    if (showFunctionsReminder && status !== "clear") {
      setActionError(
        "Cadastre pelo menos uma função na escala antes de informar disponibilidade.",
      );
      return;
    }

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

  useEffect(() => {
    if (!data || !hasRosterProfileHash()) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollToRosterProfileSection();
    });

    return () => cancelAnimationFrame(frame);
  }, [data?.ministryId]);

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
      {showFunctionsReminder && (
        <RosterFunctionsReminder
          ministryId={data.ministryId}
          ministryName={data.ministryName}
        />
      )}

      <WorshipAvailabilityWindowPanel
        ministryId={ministryId}
        canManage={canManage}
        window={data.availabilityWindow}
      />

      <section
        id={ROSTER_PROFILE_SECTION_ID}
        className="scroll-mt-24 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft"
      >
        <header className="border-b border-border/60 bg-muted/25 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
              <ClipboardList className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                Seu perfil na escala
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Informe como você costuma servir neste ministério e, nas séries
                abaixo, marque as datas em que pode participar. O líder monta a
                escala de cada evento com base nisso.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-4 p-5 sm:p-6">
          {actionError && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {actionError}
            </p>
          )}

          <RosterFunctionsEditor
            value={rosterFunctions}
            onChange={(next) => setFunctionsDraft(next)}
            disabled={updateProfile.isPending}
            dirty={functionsDirty}
            saving={updateProfile.isPending}
            onDiscard={discardFunctions}
            onSave={() => void saveFunctions()}
          />

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
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Séries e eventos
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Toque em uma série para abrir as datas e marcar sua disponibilidade.
          </p>
        </div>

        {!data.availabilityWindow.active ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-5 py-10 text-center">
            <CalendarDays className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">
              Aguardando o líder abrir um período
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Você só precisa responder os eventos do período que o líder
              escolher (semana, mês, trimestre…). Assim a lista fica curta e
              fácil.
            </p>
          </div>
        ) : data.series.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-5 py-10 text-center">
            <CalendarDays className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">
              Nenhum evento neste período
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              O período <strong>{data.availabilityWindow.label}</strong> está
              aberto, mas ainda não há eventos cadastrados nele.
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
              needsRosterFunctions={showFunctionsReminder}
              ministryId={ministryId}
            />
          ))
        )}
      </section>
    </div>
  );
}
