"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Layers } from "lucide-react";

import {
  AssignmentCard,
  AvailabilityCard,
  PendingCard,
} from "@/components/dashboard/my-schedule/my-schedule-cards";
import { RosterFunctionsReminder } from "@/components/dashboard/ministries/roster-functions-reminder";
import { MyScheduleCalendar } from "@/components/dashboard/my-schedule/my-schedule-calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES, ministryAvailabilityPath } from "@/constants/routes";
import { useMySchedules } from "@/lib/api/queries";
import { useRespondToRosterAvailability } from "@/lib/api/queries/use-respond-worship-availability";
import type { ScheduleAvailabilityAction } from "@/lib/my-schedule/event-display";
import { canListMinistries } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import type { MyMinistrySchedule, MyScheduleEvent } from "@/types/ministries";

interface MyScheduleMinistryContentProps {
  ministryId: string;
}

function filterPendingEvents(events: MyScheduleEvent[]) {
  return events.filter(
    (event) =>
      event.rosterOpen &&
      event.myAvailabilityStatus === null &&
      event.myRoleLabel === null,
  );
}

function filterAssignedEvents(events: MyScheduleEvent[]) {
  return events.filter((event) => event.myRoleLabel !== null);
}

function filterRespondedEvents(events: MyScheduleEvent[]) {
  return events.filter(
    (event) =>
      event.rosterOpen &&
      event.myAvailabilityStatus !== null &&
      event.myRoleLabel === null,
  );
}

function MinistryScheduleDetail({
  ministry,
  busyEventId,
  respondBusy,
  onRespond,
  showMinistryLink,
}: {
  ministry: MyMinistrySchedule;
  busyEventId: string | null;
  respondBusy: boolean;
  onRespond: (
    ministryId: string,
    eventId: string,
    status: ScheduleAvailabilityAction,
  ) => void;
  showMinistryLink: boolean;
}) {
  const pendingEvents = useMemo(
    () => filterPendingEvents(ministry.events ?? []),
    [ministry.events],
  );
  const assignedEvents = useMemo(
    () => filterAssignedEvents(ministry.events ?? []),
    [ministry.events],
  );
  const respondedEvents = useMemo(
    () => filterRespondedEvents(ministry.events ?? []),
    [ministry.events],
  );
  const isEmpty = (ministry.events ?? []).length === 0;

  return (
    <div className="space-y-6">
      {showMinistryLink && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" asChild>
            <Link href={ministryAvailabilityPath(ministry.ministryId)}>
              Ver no ministério
            </Link>
          </Button>
        </div>
      )}

      {ministry.needsRosterFunctions && (
        <RosterFunctionsReminder
          ministryId={ministry.ministryId}
          ministryName={ministry.ministryName}
        />
      )}

      {ministry.availabilityWindow.active && ministry.availabilityWindow.label && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Período aberto para respostas
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {ministry.availabilityWindow.label}
          </p>
        </div>
      )}

      <MyScheduleCalendar
        events={ministry.events ?? []}
        busyEventId={busyEventId}
        respondBusy={respondBusy}
        needsRosterFunctions={ministry.needsRosterFunctions}
        onRespond={onRespond}
      />

      {pendingEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Responder agora</h2>
          {pendingEvents.map((event) => (
            <PendingCard
              key={event.eventId}
              event={event}
              busy={busyEventId === event.eventId || respondBusy}
              needsRosterFunctions={ministry.needsRosterFunctions}
              onRespond={(status) =>
                onRespond(ministry.ministryId, event.eventId, status)
              }
            />
          ))}
        </div>
      )}

      {respondedEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Suas respostas</h2>
          {respondedEvents.map((event) => (
            <AvailabilityCard
              key={event.eventId}
              event={event}
              busy={busyEventId === event.eventId || respondBusy}
              needsRosterFunctions={ministry.needsRosterFunctions}
              onRespond={(status) =>
                onRespond(ministry.ministryId, event.eventId, status)
              }
            />
          ))}
        </div>
      )}

      {assignedEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Escalas confirmadas
          </h2>
          {assignedEvents.map((event) => (
            <AssignmentCard key={event.eventId} event={event} />
          ))}
        </div>
      )}

      {isEmpty && (
        <p className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
          Nada pendente neste ministério. Quando o líder abrir novas datas, você
          verá aqui.
        </p>
      )}
    </div>
  );
}

export function MyScheduleMinistryContent({
  ministryId,
}: MyScheduleMinistryContentProps) {
  const { permissions } = useAuth();
  const { data, isLoading, isError } = useMySchedules();
  const respond = useRespondToRosterAvailability();
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const ministry = data?.ministries.find(
    (item) => item.ministryId === ministryId,
  );
  const showMinistryLink = canListMinistries(permissions);

  async function handleRespond(
    targetMinistryId: string,
    eventId: string,
    status: ScheduleAvailabilityAction,
  ) {
    if (ministry?.needsRosterFunctions && status !== "clear") {
      setActionError(
        "Cadastre pelo menos uma função na escala antes de informar disponibilidade.",
      );
      return;
    }

    setActionError(null);
    setBusyEventId(eventId);

    try {
      await respond.mutateAsync({
        ministryId: targetMinistryId,
        eventId,
        status,
      });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar sua resposta.",
      );
    } finally {
      setBusyEventId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border bg-muted/20 px-5 py-8 text-center text-sm text-muted-foreground">
        Não foi possível carregar suas escalas. Tente novamente em instantes.
      </div>
    );
  }

  if (!ministry) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href={AUTH_ROUTES.mySchedules}>
            <ArrowLeft className="size-4" />
            Minhas escalas
          </Link>
        </Button>
        <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
          <Layers className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-display text-lg font-semibold text-foreground">
            Ministério não encontrado
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Você não participa deste ministério ou ele não usa escalas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link href={AUTH_ROUTES.mySchedules}>
          <ArrowLeft className="size-4" />
          Minhas escalas
        </Link>
      </Button>

      {actionError && (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {actionError}
        </p>
      )}

      <MinistryScheduleDetail
        ministry={ministry}
        busyEventId={busyEventId}
        respondBusy={respond.isPending}
        onRespond={(targetMinistryId, eventId, status) =>
          void handleRespond(targetMinistryId, eventId, status)
        }
        showMinistryLink={showMinistryLink}
      />
    </div>
  );
}
