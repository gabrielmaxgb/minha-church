"use client";

import Link from "next/link";
import { Calendar, ChevronRight, MapPin, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  onCreateActivity: () => void;
}

export function DashboardHero({
  userName,
  churchName,
  nextEvent,
  canCreateActivity,
  onCreateActivity,
}: DashboardHeroProps) {
  const relativeDay = nextEvent
    ? formatRelativeEventDay(nextEvent.startsAt)
    : null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/40 p-6 shadow-soft sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-foreground/[0.03] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-1/3 size-48 rounded-full bg-amber-500/[0.06] blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {formatLongDate()}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {getTimeGreeting()}, {getFirstName(userName)}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Panorama de hoje na{" "}
            <span className="font-medium text-foreground">{churchName}</span>
            {" "}— membros, atividades e o que vem a seguir.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canCreateActivity && (
            <Button size="sm" className="gap-2" onClick={onCreateActivity}>
              <Plus className="size-4" />
              Nova atividade
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link href={AUTH_ROUTES.members}>Ver membros</Link>
          </Button>
        </div>
      </div>

      {nextEvent ? (
        <Link
          href={AUTH_ROUTES.activities}
          className="group relative mt-6 block rounded-2xl border border-border/60 bg-surface-elevated/80 p-4 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-soft sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-foreground text-background shadow-soft">
                <span className="text-lg font-bold leading-none">
                  {new Date(nextEvent.startsAt).getDate()}
                </span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  {new Intl.DateTimeFormat("pt-BR", { month: "short" })
                    .format(new Date(nextEvent.startsAt))
                    .replace(".", "")}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Próximo na agenda
                  </p>
                  {relativeDay && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        relativeDay === "Hoje"
                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {relativeDay}
                    </span>
                  )}
                  {nextEvent.isChurchWide && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-foreground">
                      <Sparkles className="size-3" />
                      Igreja
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {nextEvent.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0" />
                    {formatEventTime(nextEvent.startsAt)}
                  </span>
                  {nextEvent.location && (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{nextEvent.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              Ver agenda
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-4">
          <p className="text-sm font-medium text-foreground">
            Nenhuma atividade agendada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {canCreateActivity
              ? "Crie a primeira atividade para a igreja começar a planejar."
              : "Quando houver eventos, eles aparecerão aqui."}
          </p>
          {canCreateActivity && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 gap-2"
              onClick={onCreateActivity}
            >
              <Plus className="size-4" />
              Agendar atividade
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
