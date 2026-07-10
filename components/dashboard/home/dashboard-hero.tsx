"use client";

import Link from "next/link";
import { Calendar, ChevronRight, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  formatEventTime,
  formatLongDate,
  formatRelativeEventDay,
  getFirstName,
  getTimeGreeting,
} from "@/lib/dashboard/date-utils";
import { cn } from "@/lib/utils";
import type { ChurchEvent } from "@/types/events";

interface DashboardHeroProps {
  userName: string;
  churchName: string;
  nextEvent: ChurchEvent | null;
  canCreateActivity: boolean;
  canAccessMembers: boolean;
  canAccessActivities: boolean;
  onCreateActivity: () => void;
}

export function DashboardHero({
  userName,
  nextEvent,
  canCreateActivity,
  canAccessMembers,
  canAccessActivities,
  onCreateActivity,
}: DashboardHeroProps) {
  const { locked, reason } = useFeatureLock();
  const relativeDay = nextEvent
    ? formatRelativeEventDay(nextEvent.startsAt)
    : null;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-muted-foreground">{formatLongDate()}</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {getTimeGreeting()}, {getFirstName(userName)}
          </h2>
        </div>

        {(canCreateActivity || canAccessMembers) && (
          <div className="flex flex-wrap gap-2">
            {canCreateActivity && (
              <Button
                size="sm"
                onClick={onCreateActivity}
                disabled={locked}
                title={reason ?? undefined}
              >
                <Plus className="size-4" />
                Nova atividade
              </Button>
            )}
            {canAccessMembers && (
              <Button size="sm" variant="outline" asChild>
                <Link href={AUTH_ROUTES.members}>Ver membros</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {canAccessActivities && nextEvent ? (
        <Link
          href={AUTH_ROUTES.activities}
          className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:bg-muted/40"
        >
          <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-md bg-foreground text-background">
            <span className="text-sm font-semibold leading-none">
              {new Date(nextEvent.startsAt).getDate()}
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
              {new Intl.DateTimeFormat("pt-BR", { month: "short" })
                .format(new Date(nextEvent.startsAt))
                .replace(".", "")}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Próximo culto / atividade
              </p>
              {relativeDay && (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                    relativeDay === "Hoje"
                      ? "bg-attention-subtle text-attention-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {relativeDay}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-base font-medium text-foreground">
              {nextEvent.name}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3 shrink-0" />
                {formatEventTime(nextEvent.startsAt)}
              </span>
              {nextEvent.location && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{nextEvent.location}</span>
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : canAccessActivities ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-4 py-4">
          <p className="text-sm font-medium text-foreground">
            Nenhuma atividade agendada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {canCreateActivity
              ? "Agende o próximo culto ou encontro para a equipe se organizar."
              : "Quando houver eventos, eles aparecerão aqui."}
          </p>
          {canCreateActivity && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={onCreateActivity}
              disabled={locked}
              title={reason ?? undefined}
            >
              <Plus className="size-4" />
              Agendar atividade
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );
}
