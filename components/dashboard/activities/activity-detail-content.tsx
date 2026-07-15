"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  Layers,
  MapPin,
  Pencil,
  Repeat,
  Sparkles,
} from "lucide-react";

import { ActivityAvailabilitySection } from "@/components/dashboard/activities/activity-availability-section";
import { ActivityEventModal } from "@/components/dashboard/activities/activity-event-modal";
import { ActivityOccurrenceNav } from "@/components/dashboard/activities/activity-occurrence-nav";
import { ActivityRosterSection } from "@/components/dashboard/activities/activity-roster-section";
import { EventHighlightNote } from "@/components/dashboard/activities/event-highlight-note";
import { EventRosterPublicCard } from "@/components/dashboard/activities/event-roster-assignments";
import { InactiveMinistryBanner } from "@/components/dashboard/ministries/inactive-ministry-banner";
import { TrialExpiredWriteModal } from "@/components/dashboard/trial-expired-write-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  activitiesCalendarPath,
  AUTH_ROUTES,
  ministryDetailPath,
} from "@/constants/routes";
import { useChurchEvent } from "@/lib/api/queries";
import { dateKeyFromIso } from "@/lib/events/calendar";
import {
  formatEventDateChip,
  formatEventTime,
  formatLongDate,
  formatRelativeEventDay,
} from "@/lib/dashboard/date-utils";
import { formatRecurrenceSummary } from "@/lib/events/recurrence";
import {
  canManageActivity,
  canManageEventRoster,
} from "@/lib/permissions";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface ActivityDetailContentProps {
  eventId: string;
}

function SecondaryMeta({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

function EventWhen({
  startsAt,
  timeLabel,
}: {
  startsAt: string;
  timeLabel: string;
}) {
  const chip = formatEventDateChip(startsAt);
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(
    new Date(startsAt),
  );
  const dayMonth = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
  }).format(new Date(startsAt));

  return (
    <div className="flex items-stretch gap-4 sm:gap-5">
      <time
        dateTime={startsAt}
        className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/40 py-2.5 text-center shadow-xs sm:w-16"
        aria-label={formatLongDate(new Date(startsAt))}
      >
        <span className="text-[1.65rem] font-semibold leading-none tracking-tight text-foreground sm:text-[1.85rem]">
          {chip.day}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {chip.month}
        </span>
      </time>

      <div className="flex min-w-0 flex-col justify-center gap-1">
        <p className="text-sm font-medium capitalize tracking-tight text-foreground sm:text-[0.95rem]">
          <span className="capitalize">{weekday}</span>
          <span className="mx-1.5 text-border">·</span>
          <span>{dayMonth}</span>
        </p>
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.75rem]">
          {timeLabel}
        </p>
      </div>
    </div>
  );
}

export function ActivityDetailContent({ eventId }: ActivityDetailContentProps) {
  const router = useRouter();
  const { user, permissions } = useAuth();
  const { data: event, isLoading, isError, error } = useChurchEvent(eventId);
  const [editOpen, setEditOpen] = useState(false);
  const { writesBlocked, guardWrite, paywallAction, closePaywall } =
    useTrialWriteGuard();

  const canManage =
    event && permissions
      ? canManageActivity(permissions, event, user?.id ?? null)
      : false;
  const canManageRoster =
    event && permissions
      ? canManageEventRoster(permissions, event, user?.id ?? null)
      : false;
  const showAvailabilityPanel = Boolean(
    event?.usesRoster &&
      event.rosterOpen &&
      !canManageRoster &&
      event.canRespondToAvailability,
  );
  const relativeEventDay = event ? formatRelativeEventDay(event.startsAt) : null;
  const ministryInactive = Boolean(
    event?.ministryId && !event.ministryIsActive,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="space-y-4">
        <Link
          href={AUTH_ROUTES.activities}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para atividades
        </Link>

        <div className="rounded-2xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar a atividade."}
        </div>
      </div>
    );
  }

  const timeLabel = event.endsAt
    ? `${formatEventTime(event.startsAt)} – ${formatEventTime(event.endsAt)}`
    : formatEventTime(event.startsAt);

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={AUTH_ROUTES.activities}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Atividades
          </Link>

          {!ministryInactive ? (
            <div className="flex flex-wrap items-center gap-2">
              <ActivityOccurrenceNav event={event} />
              <Button size="sm" variant="outline" asChild>
                <Link
                  href={activitiesCalendarPath(dateKeyFromIso(event.startsAt))}
                >
                  <CalendarDays className="size-4" />
                  Calendário
                </Link>
              </Button>
              {canManage ? (
                <Button
                  size="sm"
                  onClick={() =>
                    guardWrite("editar atividades", () => setEditOpen(true))
                  }
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {ministryInactive && (
          <InactiveMinistryBanner
            ministryName={event.ministryName}
            ministryHref={
              event.ministryId
                ? ministryDetailPath(event.ministryId)
                : undefined
            }
          />
        )}

        <div
          className={cn(
            "space-y-5",
            ministryInactive && "pointer-events-none select-none opacity-60",
          )}
          aria-hidden={ministryInactive || undefined}
        >
          <header className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-wrap items-center gap-2">
                {!event.isChurchWide &&
                event.ministryName &&
                event.ministryId ? (
                  writesBlocked ? (
                    <Badge
                      variant="secondary"
                      className="gap-1.5 font-medium"
                    >
                      <Layers className="size-3.5" aria-hidden />
                      {event.ministryName}
                    </Badge>
                  ) : (
                    <Link href={ministryDetailPath(event.ministryId)}>
                      <Badge
                        variant="secondary"
                        className="gap-1.5 font-medium hover:bg-muted"
                      >
                        <Layers className="size-3.5" aria-hidden />
                        {event.ministryName}
                      </Badge>
                    </Link>
                  )
                ) : null}

                {event.isChurchWide ? (
                  <Badge variant="secondary" className="gap-1.5 font-medium">
                    <Sparkles className="size-3" aria-hidden />
                    Igreja
                  </Badge>
                ) : null}

                {relativeEventDay ? (
                  <Badge className="font-medium">{relativeEventDay}</Badge>
                ) : null}

                {event.recurrence ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground"
                    title={formatRecurrenceSummary(
                      event.recurrence,
                      event.startsAt,
                    )}
                  >
                    <Repeat className="size-3" aria-hidden />
                    Recorrente
                  </span>
                ) : null}
              </div>

              <EventWhen startsAt={event.startsAt} timeLabel={timeLabel} />

              <div className="space-y-2 border-t border-border/60 pt-5">
                <h1 className="page-title max-w-3xl">{event.name}</h1>
                {event.description ? (
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                ) : null}
              </div>
            </div>

            {(event.location ||
              (canManage && !event.isChurchWide) ||
              event.recurrence) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 bg-muted/25 px-5 py-3 sm:px-6">
                {event.location ? (
                  <SecondaryMeta icon={MapPin}>{event.location}</SecondaryMeta>
                ) : null}
                {canManage && !event.isChurchWide ? (
                  <SecondaryMeta
                    icon={event.visibleToChurch ? Eye : EyeOff}
                  >
                    {event.visibleToChurch
                      ? "Visível na agenda da igreja"
                      : "Somente no ministério"}
                  </SecondaryMeta>
                ) : null}
                {event.recurrence ? (
                  <SecondaryMeta icon={Repeat}>
                    {formatRecurrenceSummary(
                      event.recurrence,
                      event.startsAt,
                    )}
                  </SecondaryMeta>
                ) : null}
              </div>
            )}
          </header>

          {event.highlightNote ? (
            <EventHighlightNote note={event.highlightNote} />
          ) : null}

          {canManageRoster ? (
            <ActivityRosterSection event={event} readOnly={writesBlocked} />
          ) : event.usesRoster ? (
            <EventRosterPublicCard event={event} />
          ) : null}

          {showAvailabilityPanel ? (
            <ActivityAvailabilitySection
              event={event}
              interactionsDisabled={writesBlocked}
            />
          ) : null}
        </div>
      </div>

      <ActivityEventModal
        eventId={event.id}
        open={editOpen}
        initialMode="edit"
        onClose={() => setEditOpen(false)}
        onDeleted={() => router.push(AUTH_ROUTES.activities)}
      />

      <TrialExpiredWriteModal
        open={paywallAction !== null}
        onClose={closePaywall}
        action={paywallAction ?? undefined}
      />
    </>
  );
}
