"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTES, activityDetailPath } from "@/constants/routes";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { useMySchedules } from "@/lib/api/queries";
import { firstPendingScheduleHref } from "@/lib/my-schedule/schedule-notifications";
import { canAccessSchedules } from "@/lib/permissions";
import {
  formatEventTime,
  formatRelativeEventDay,
} from "@/lib/dashboard/date-utils";
import { formatRosterRole } from "@/lib/ministries/roster";
import { useAuth } from "@/providers/auth-provider";

export function ScheduleBanner() {
  const { permissions } = useAuth();
  const canAccessSchedulesData = canAccessSchedules(permissions);
  const { data, isLoading } = useMySchedules({
    enabled: canAccessSchedulesData,
  });

  if (!canAccessSchedulesData || isLoading || !data?.hasSchedule) {
    return null;
  }

  const pending = data.summary.pendingAvailabilityCount;
  const next = data.summary.nextAssignment;

  if (pending === 0 && !next) {
    return null;
  }

  if (pending > 0) {
    const respondHref = firstPendingScheduleHref(data);

    return (
      <Link
        href={respondHref}
        className={pendingNotificationStyles.banner.interactive}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-xs">
              <AlertCircle className="size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className={pendingNotificationStyles.label}>
                Escalas aguardando resposta
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Diga se pode servir na escala
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pending} evento{pending === 1 ? "" : "s"} aguardando sua
                resposta sobre servir na equipe.
              </p>
            </div>
          </div>
          <Button variant="default" size="lg" className="shrink-0" asChild>
            <span className="inline-flex items-center gap-2">
              Responder agora
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Button>
        </div>
      </Link>
    );
  }

  if (next) {
    const relative = formatRelativeEventDay(next.startsAt);

    return (
      <Link
        href={activityDetailPath(next.eventId)}
        className="group block overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/40 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
              <CalendarDays className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Próxima escala · {next.ministryName}
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                {formatRosterRole(next.roleLabel)} · {next.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {relative ? `${relative} · ` : ""}
                {formatEventTime(next.startsAt)}
                {next.location ? ` · ${next.location}` : ""}
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground">
            Ver detalhes
            <ChevronRight className="size-4" />
          </span>
        </div>
      </Link>
    );
  }

  return null;
}

/** @deprecated Use ScheduleBanner */
export const WorshipScheduleBanner = ScheduleBanner;
