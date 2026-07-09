"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
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
    event?.usesRoster && event.rosterOpen && !canManageRoster,
  );
  const eventDateChip = event ? formatEventDateChip(event.startsAt) : null;
  const relativeEventDay = event ? formatRelativeEventDay(event.startsAt) : null;
  const ministryInactive = Boolean(
    event?.ministryId && !event.ministryIsActive,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-[28rem] rounded-2xl" />
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

        <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar a atividade."}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Link
          href={AUTH_ROUTES.activities}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para atividades
        </Link>

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

        {!ministryInactive ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ActivityOccurrenceNav event={event} />
            <Button size="sm" variant="outline" asChild>
              <Link href={activitiesCalendarPath(dateKeyFromIso(event.startsAt))}>
                <CalendarDays className="size-4" />
                Ver no calendário
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

        <div
          className={cn(
            "space-y-6",
            ministryInactive && "pointer-events-none select-none opacity-60",
          )}
          aria-hidden={ministryInactive || undefined}
        >
        <Card
          className={cn(
            event.isChurchWide &&
              "border-primary/15 bg-gradient-to-br from-card to-muted/30",
          )}
        >
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {!event.isChurchWide && event.ministryName && event.ministryId && (
                writesBlocked ? (
                  <Badge className="gap-1.5 border border-primary/25 bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
                    <Layers className="size-3.5" />
                    {event.ministryName}
                  </Badge>
                ) : (
                  <Link href={ministryDetailPath(event.ministryId)}>
                    <Badge className="gap-1.5 border border-primary/25 bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary hover:bg-primary/15">
                      <Layers className="size-3.5" />
                      {event.ministryName}
                    </Badge>
                  </Link>
                )
              )}
              {event.isChurchWide && (
                <Badge className="gap-1.5">
                  <Sparkles className="size-3" />
                  Igreja
                </Badge>
              )}
              {event.recurrence && (
                <span
                  className="inline-flex size-7 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-muted-foreground"
                  title={formatRecurrenceSummary(event.recurrence, event.startsAt)}
                  aria-label={`Recorrente: ${formatRecurrenceSummary(event.recurrence, event.startsAt)}`}
                >
                  <Repeat className="size-3.5" aria-hidden />
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              {event.name}
            </h1>

            {event.description && (
              <CardDescription className="mt-2 text-sm leading-relaxed">
                {event.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-center gap-4">
                {eventDateChip ? (
                  <div
                    className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-primary/15 bg-background px-3.5 py-2.5 shadow-soft"
                    aria-hidden
                  >
                    <span className="font-display text-3xl font-bold leading-none tabular-nums text-foreground">
                      {eventDateChip.day}
                    </span>
                    <span className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
                      {eventDateChip.month}
                    </span>
                  </div>
                ) : null}

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                    Data e hora
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold capitalize leading-tight text-foreground sm:text-2xl">
                    {formatLongDate(new Date(event.startsAt))}
                  </p>
                  {relativeEventDay ? (
                    <Badge variant="secondary" className="mt-2">
                      {relativeEventDay}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-primary" aria-hidden />
                  <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
                    {formatEventTime(event.startsAt)}
                  </p>
                </div>
                {event.endsAt ? (
                  <p className="text-sm text-muted-foreground">
                    até {formatEventTime(event.endsAt)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {event.location && (
                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-3.5 sm:col-span-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Local
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              )}

              {event.recurrence && (
                <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3.5 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Repetição
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {formatRecurrenceSummary(event.recurrence, event.startsAt)}
                  </p>
                </div>
              )}
            </div>

            {canManage && !event.isChurchWide ? (
              <div className="mt-4 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                Visível na agenda da igreja:{" "}
                <span className="font-medium text-foreground">
                  {event.visibleToChurch ? "Sim" : "Somente ministério"}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>

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
