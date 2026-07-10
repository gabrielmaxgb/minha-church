"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
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
import { formatEventCountdown } from "@/lib/dashboard/week-density";
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
  churchName,
  nextEvent,
  canCreateActivity,
  canAccessMembers,
  canAccessActivities,
  onCreateActivity,
}: DashboardHeroProps) {
  const { locked, reason } = useFeatureLock();
  const shouldReduceMotion = useReducedMotion();
  const relativeDay = nextEvent
    ? formatRelativeEventDay(nextEvent.startsAt)
    : null;
  const countdown = nextEvent
    ? formatEventCountdown(nextEvent.startsAt)
    : null;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-muted-foreground">
            {formatLongDate()}
            {churchName ? ` · ${churchName}` : ""}
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {getTimeGreeting()}, {getFirstName(userName)}
          </h2>
          <p className="text-sm text-muted-foreground">
            Aqui está o essencial da sua semana.
          </p>
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
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={AUTH_ROUTES.activities}
            className="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-domain-activities/25 bg-gradient-to-br from-domain-activities-subtle via-card to-card p-4 shadow-xs transition-colors duration-150 hover:border-domain-activities/40 sm:items-center sm:gap-4 sm:p-5"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-domain-activities/10 blur-2xl"
              aria-hidden
            />
            <div className="relative flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-domain-activities text-white shadow-xs sm:size-16">
              <span className="text-lg font-semibold leading-none sm:text-xl">
                {new Date(nextEvent.startsAt).getDate()}
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-90">
                {new Intl.DateTimeFormat("pt-BR", { month: "short" })
                  .format(new Date(nextEvent.startsAt))
                  .replace(".", "")}
              </span>
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-domain-activities-foreground">
                  Próximo culto
                </p>
                {relativeDay && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                      relativeDay === "Hoje"
                        ? "bg-attention-subtle text-attention-foreground"
                        : "bg-domain-activities/10 text-domain-activities-foreground",
                    )}
                  >
                    {relativeDay}
                  </span>
                )}
                {countdown && (
                  <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {countdown}
                  </span>
                )}
              </div>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground break-words sm:text-xl">
                {nextEvent.name}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5 shrink-0" />
                  {formatEventTime(nextEvent.startsAt)}
                </span>
                {nextEvent.location && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{nextEvent.location}</span>
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="relative mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:mt-0" />
          </Link>
        </motion.div>
      ) : canAccessActivities ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-4 py-5">
          <p className="text-sm font-medium text-foreground">
            Nenhuma atividade agendada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {canCreateActivity
              ? "Agende o próximo culto para a equipe se organizar."
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
