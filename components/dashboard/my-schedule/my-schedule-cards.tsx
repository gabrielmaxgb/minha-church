"use client";

import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  MapPin,
} from "lucide-react";

import { ScheduleEventRosterList } from "@/components/dashboard/my-schedule/schedule-event-roster-list";
import { AvailabilityRespondActions } from "@/components/dashboard/my-schedule/availability-respond-actions";
import { Badge } from "@/components/ui/badge";
import { activityDetailPath } from "@/constants/routes";
import {
  formatEventTime,
  formatRelativeEventDay,
} from "@/lib/dashboard/date-utils";
import type { ScheduleAvailabilityAction } from "@/lib/my-schedule/event-display";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import type { MyScheduleEvent } from "@/types/ministries";

export function formatScheduleDay(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function PendingCard({
  event,
  busy,
  needsRosterFunctions = false,
  onRespond,
}: {
  event: MyScheduleEvent;
  busy: boolean;
  needsRosterFunctions?: boolean;
  onRespond: (status: ScheduleAvailabilityAction) => void;
}) {
  const relative = formatRelativeEventDay(event.startsAt);

  return (
    <article className={pendingNotificationStyles.schedule.card}>
      <div className={pendingNotificationStyles.schedule.cardHeader}>
        <p className={pendingNotificationStyles.label}>
          Precisamos da sua resposta
        </p>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
              {event.name}
            </h3>
            {relative && (
              <Badge className={pendingNotificationStyles.badge}>
                {relative}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm font-medium capitalize text-foreground">
            {formatScheduleDay(event.startsAt)}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formatEventTime(event.startsAt)}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {event.location}
              </span>
            )}
          </div>
        </div>

        <ScheduleEventRosterList roster={event.roster} />

        <p className="rounded-xl bg-muted/40 px-3 py-2 text-sm text-foreground">
          {needsRosterFunctions ? (
            <>
              Primeiro informe <strong>como você serve</strong> neste ministério.
              Depois disso você poderá responder se pode ir aos eventos.
            </>
          ) : (
            <>
              Sem sua resposta, o líder{" "}
              <strong>não consegue montar a escala</strong> deste evento.
            </>
          )}
        </p>

        <AvailabilityRespondActions
          ministryId={event.ministryId}
          needsRosterFunctions={needsRosterFunctions}
          busy={busy}
          layout="card"
          onRespond={onRespond}
        />
      </div>
    </article>
  );
}

export function AvailabilityCard({
  event,
  busy,
  needsRosterFunctions = false,
  onRespond,
}: {
  event: MyScheduleEvent;
  busy: boolean;
  needsRosterFunctions?: boolean;
  onRespond: (status: ScheduleAvailabilityAction) => void;
}) {
  const relative = formatRelativeEventDay(event.startsAt);
  const isAvailable = event.myAvailabilityStatus === "available";

  return (
    <article
      className={
        isAvailable
          ? "overflow-hidden rounded-2xl border border-sky-500/30 bg-sky-500/5 shadow-soft"
          : "overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-soft"
      }
    >
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {event.name}
            </h3>
            <Badge
              className={
                isAvailable
                  ? "bg-sky-500 text-sky-950 hover:bg-sky-500"
                  : undefined
              }
              variant={isAvailable ? "default" : "secondary"}
            >
              {isAvailable ? "Disponível" : "Indisponível"}
            </Badge>
            {relative && (
              <Badge variant="secondary">{relative}</Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatEventTime(event.startsAt)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
        </div>

        <ScheduleEventRosterList roster={event.roster} />

        {event.rosterOpen && (
          <AvailabilityRespondActions
            ministryId={event.ministryId}
            needsRosterFunctions={needsRosterFunctions}
            busy={busy}
            availabilityStatus={event.myAvailabilityStatus}
            showClear
            onRespond={onRespond}
          />
        )}
      </div>
    </article>
  );
}

export function AssignmentCard({ event }: { event: MyScheduleEvent }) {
  const relative = formatRelativeEventDay(event.startsAt);
  const day = new Date(event.startsAt).getDate();
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(new Date(event.startsAt))
    .replace(".", "");

  return (
    <Link
      href={activityDetailPath(event.eventId)}
      className="group block overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/8 via-card to-card shadow-soft transition-all hover:border-emerald-500/50 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
        <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-foreground text-background shadow-soft">
          <span className="text-2xl font-bold leading-none">{day}</span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-80">
            {month}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Você está escalado
          </p>
          <p className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            {event.myRoleLabel}
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{event.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {relative && (
              <Badge variant="secondary" className="font-semibold">
                {relative}
              </Badge>
            )}
            <span>{formatEventTime(event.startsAt)}</span>
            {event.location && (
              <>
                <span aria-hidden>·</span>
                <span>{event.location}</span>
              </>
            )}
          </div>

          <ScheduleEventRosterList roster={event.roster} className="mt-4" />
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Ver evento
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
