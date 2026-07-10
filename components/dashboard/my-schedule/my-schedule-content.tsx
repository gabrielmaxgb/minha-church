"use client";

import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { myScheduleMinistryPath } from "@/constants/routes";
import { CHURCH_WIDE_SCHEDULE_ID } from "@/lib/events/church-wide-schedule";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { useMySchedules } from "@/lib/api/queries";
import type { MyMinistrySchedule } from "@/types/ministries";

function ministrySummary(ministry: MyMinistrySchedule): string {
  const pending = ministry.pendingAvailability.length;
  const assignments = ministry.upcomingAssignments.length;

  if (pending > 0) {
    return `${pending} resposta${pending === 1 ? "" : "s"} pendente${pending === 1 ? "" : "s"}`;
  }

  if (assignments > 0) {
    return `${assignments} escala${assignments === 1 ? "" : "s"} confirmada${assignments === 1 ? "" : "s"}`;
  }

  return "Nenhuma escala ou pedido no momento";
}

function sortMinistries(ministries: MyMinistrySchedule[]): MyMinistrySchedule[] {
  return [...ministries].sort((a, b) => {
    if (a.ministryId === CHURCH_WIDE_SCHEDULE_ID) {
      return -1;
    }

    if (b.ministryId === CHURCH_WIDE_SCHEDULE_ID) {
      return 1;
    }

    const pendingDiff =
      b.pendingAvailability.length - a.pendingAvailability.length;

    if (pendingDiff !== 0) {
      return pendingDiff;
    }

    return a.ministryName.localeCompare(b.ministryName, "pt-BR");
  });
}

export function MyScheduleContent() {
  const { data, isLoading, isError } = useMySchedules();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 px-5 py-8 text-center text-sm text-muted-foreground">
        Não foi possível carregar suas escalas. Tente novamente em instantes.
      </div>
    );
  }

  if (!data.hasSchedule) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
        <Layers className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-4 text-base font-semibold text-foreground">
          Nenhuma escala no momento
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Quando houver eventos com coleta de disponibilidade aberta ou escalas
          confirmadas para você, elas aparecem aqui.
        </p>
      </div>
    );
  }

  const totalPending = data.summary.pendingAvailabilityCount;
  const ministries = sortMinistries([
    ...(data.churchWide ? [data.churchWide] : []),
    ...data.ministries,
  ]);
  const groupCount = ministries.length;

  return (
    <div className="space-y-6">
      {totalPending > 0 && (
        <div className={pendingNotificationStyles.banner.inline}>
          <p className="text-sm font-medium text-foreground">
            {totalPending} evento{totalPending === 1 ? "" : "s"} aguardando sua
            resposta em {groupCount} grupo
            {groupCount === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Escolha um grupo para ver o calendário, responder disponibilidade e
        acompanhar suas escalas.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {ministries.map((ministry) => {
          const pending = ministry.pendingAvailability.length;
          const openEvents = (ministry.events ?? []).filter(
            (event) => event.rosterOpen,
          ).length;

          return (
            <Link
              key={ministry.ministryId}
              href={myScheduleMinistryPath(ministry.ministryId)}
              className="flex items-center gap-3 border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <Layers className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    {ministry.ministryName}
                  </p>
                  {pending > 0 && (
                    <Badge className={pendingNotificationStyles.badge}>
                      {pending} pendente{pending === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {ministrySummary(ministry)}
                </p>
                {openEvents > 0 && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    {openEvents} evento{openEvents === 1 ? "" : "s"} aberto
                    {openEvents === 1 ? "" : "s"} para resposta
                  </p>
                )}
              </div>

              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
