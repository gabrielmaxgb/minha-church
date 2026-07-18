"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/constants/routes";
import { buildWeekDensity } from "@/lib/dashboard/week-density";
import { cn } from "@/lib/utils";
import type { ChurchEvent } from "@/types/events";

interface DashboardWeekPulseProps {
  events: ChurchEvent[];
  memberCount?: number | null;
  pendingAttentionCount?: number;
  schedulePendingCount?: number;
  canAccessMembers?: boolean;
  canAccessSchedules?: boolean;
  canAccessActivities?: boolean;
  /** `chart` = só o gráfico (para grid ao lado das prioridades). */
  variant?: "full" | "chart";
}

export function DashboardWeekPulse({
  events,
  memberCount,
  pendingAttentionCount = 0,
  schedulePendingCount = 0,
  canAccessMembers,
  canAccessSchedules,
  canAccessActivities,
  variant = "full",
}: DashboardWeekPulseProps) {
  const shouldReduceMotion = useReducedMotion();
  const week = useMemo(() => buildWeekDensity(events), [events]);
  const maxCount = Math.max(...week.map((day) => day.count), 1);
  const weekTotal = week.reduce((sum, day) => sum + day.count, 0);
  const chartOnly = variant === "chart";

  const chips = chartOnly
    ? []
    : [
        memberCount != null && canAccessMembers
          ? {
              label: "Membros",
              value: String(memberCount),
              hint: "cadastrados",
              href: AUTH_ROUTES.members,
              tone: "members" as const,
            }
          : null,
        canAccessActivities
          ? {
              label: "Esta semana",
              value: String(weekTotal),
              hint: weekTotal === 1 ? "atividade" : "atividades",
              href: AUTH_ROUTES.activities,
              tone: "activities" as const,
            }
          : null,
        pendingAttentionCount > 0
          ? {
              label: "Atenção",
              value: String(pendingAttentionCount),
              hint: "pendências",
              href: AUTH_ROUTES.settings,
              tone: "attention" as const,
            }
          : null,
        canAccessSchedules && schedulePendingCount > 0
          ? {
              label: "Escalas",
              value: String(schedulePendingCount),
              hint: "aguardando você",
              href: AUTH_ROUTES.mySchedules,
              tone: "schedules" as const,
            }
          : null,
      ].filter((chip): chip is NonNullable<typeof chip> => Boolean(chip));

  if (!canAccessActivities && chips.length === 0) {
    return null;
  }

  const chart = canAccessActivities ? (
    <div
      className={cn(
        "min-w-0 max-w-full rounded-xl border border-domain-activities/30 bg-gradient-to-br from-domain-activities-subtle via-card to-card p-4 sm:p-5",
        chartOnly && "h-full",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-domain-activities-foreground">
            Ritmo da semana
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {chartOnly
              ? "Eventos por dia na agenda"
              : "Quantas atividades em cada dia — com base na agenda real."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-domain-activities/25 bg-card/80 text-domain-activities-foreground hover:bg-domain-activities-subtle"
          >
            <Link href={AUTH_ROUTES.activities}>
              Ver agenda
              <ArrowRight className="size-3.5 opacity-80" aria-hidden />
            </Link>
          </Button>
          <p className="rounded-md bg-domain-activities/20 px-2 py-1 text-xs font-medium tabular-nums text-domain-activities-foreground">
            {weekTotal} no total
          </p>
        </div>
      </div>

      <div className="mt-5 flex h-28 min-w-0 items-end gap-1">
        {week.map((day) => {
          const heightPct =
            day.count === 0 ? 8 : Math.max(18, (day.count / maxCount) * 100);

          return (
            <div
              key={day.key}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-20 w-full items-end justify-center">
                <motion.div
                  className={cn(
                    "w-full max-w-[3.75rem] rounded-md",
                    day.count === 0
                      ? "bg-muted"
                      : day.isToday
                        ? "bg-domain-activities"
                        : "bg-domain-activities/55",
                  )}
                  initial={
                    shouldReduceMotion ? false : { height: "8%", opacity: 0.4 }
                  }
                  animate={{ height: `${heightPct}%`, opacity: 1 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    delay: shouldReduceMotion ? 0 : 0.04,
                  }}
                  title={`${day.label}: ${day.count}`}
                />
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-[10px] font-medium capitalize",
                    day.isToday
                      ? "text-domain-activities-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {day.shortLabel}
                </p>
                <p className="text-[10px] tabular-nums text-muted-foreground">
                  {day.count}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  if (chartOnly) {
    return chart;
  }

  return (
    <section
      className={cn(
        "grid gap-4",
        canAccessActivities
          ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
          : "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {chart}

      {chips.length > 0 ? (
        <div
          className={cn(
            "grid gap-3",
            canAccessActivities
              ? "grid-cols-2"
              : "grid-cols-2 sm:col-span-2 lg:col-span-4 lg:grid-cols-4",
            chips.length === 1 && !canAccessActivities && "sm:grid-cols-1",
          )}
        >
          {chips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className={cn(
                "rounded-xl border p-4 transition-colors duration-150",
                chip.tone === "members" &&
                  "border-domain-members/30 bg-domain-members-subtle hover:bg-domain-members-subtle/90",
                chip.tone === "activities" &&
                  "border-domain-activities/30 bg-domain-activities-subtle hover:bg-domain-activities-subtle/90",
                chip.tone === "attention" &&
                  "border-attention-border bg-attention-subtle hover:bg-attention-subtle/85",
                chip.tone === "schedules" &&
                  "border-domain-schedules/30 bg-domain-schedules-subtle hover:bg-domain-schedules-subtle/90",
              )}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {chip.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {chip.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{chip.hint}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

