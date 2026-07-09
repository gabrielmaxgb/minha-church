"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Layers } from "lucide-react";

import { MyScheduleCalendar } from "@/components/dashboard/my-schedule/my-schedule-calendar";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES, ministryAvailabilityPath } from "@/constants/routes";
import { CHURCH_WIDE_SCHEDULE_ID } from "@/lib/events/church-wide-schedule";
import { useMySchedules } from "@/lib/api/queries";
import { useRespondToRosterAvailability } from "@/lib/api/queries/use-respond-worship-availability";
import type { EventAvailabilityPayload } from "@/components/dashboard/my-schedule/event-availability-panel";
import { canListMinistries } from "@/lib/permissions";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import { useAuth } from "@/providers/auth-provider";
import type { MyMinistrySchedule } from "@/types/ministries";

interface MyScheduleMinistryContentProps {
  ministryId: string;
}

function MinistryScheduleDetail({
  ministry,
  busyEventId,
  respondBusy,
  interactionsDisabled,
  onRespond,
  showMinistryLink,
}: {
  ministry: MyMinistrySchedule;
  busyEventId: string | null;
  respondBusy: boolean;
  interactionsDisabled: boolean;
  onRespond: (
    ministryId: string,
    eventId: string,
    payload: EventAvailabilityPayload,
  ) => void;
  showMinistryLink: boolean;
}) {
  const hasOpenCollection = useMemo(
    () => (ministry.events ?? []).some((event) => event.rosterOpen),
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

      {interactionsDisabled && (
        <LockedFeatureHint action="marcar disponibilidade em escalas" />
      )}

      {hasOpenCollection && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Coleta de disponibilidade aberta
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            Eventos liberados para você marcar disponibilidade
          </p>
        </div>
      )}

      <MyScheduleCalendar
        events={ministry.events ?? []}
        busyEventId={busyEventId}
        respondBusy={respondBusy}
        interactionsDisabled={interactionsDisabled}
        needsRosterFunctions={ministry.needsRosterFunctions}
        ministryName={ministry.ministryName}
        onRespond={onRespond}
      />

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
  const { writesBlocked } = useTrialWriteGuard();
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const ministry =
    ministryId === CHURCH_WIDE_SCHEDULE_ID
      ? data?.churchWide
      : data?.ministries.find((item) => item.ministryId === ministryId);
  const showMinistryLink =
    canListMinistries(permissions) &&
    ministryId !== CHURCH_WIDE_SCHEDULE_ID;

  async function handleRespond(
    targetMinistryId: string,
    eventId: string,
    payload: EventAvailabilityPayload,
  ) {
    if (writesBlocked) {
      return;
    }

    setActionError(null);
    setBusyEventId(eventId);

    try {
      await respond.mutateAsync({
        ministryId: targetMinistryId,
        eventId,
        status: payload.status,
        roleLabels: payload.roleLabels,
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
            {ministryId === CHURCH_WIDE_SCHEDULE_ID
              ? "Não há eventos da igreja com escala para você no momento."
              : "Você não participa deste ministério ou ele não usa escalas."}
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
        interactionsDisabled={writesBlocked}
        onRespond={(targetMinistryId, eventId, payload) =>
          void handleRespond(targetMinistryId, eventId, payload)
        }
        showMinistryLink={showMinistryLink}
      />
    </div>
  );
}
