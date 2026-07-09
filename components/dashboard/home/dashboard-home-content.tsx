"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Layers,
  UserCheck,
  Users,
} from "lucide-react";

import { CreateActivityModal } from "@/components/dashboard/activities/create-activity-modal";
import { DashboardActionsPanel } from "@/components/dashboard/home/dashboard-actions-panel";
import { DashboardEventsPanel } from "@/components/dashboard/home/dashboard-events-panel";
import { DashboardHero } from "@/components/dashboard/home/dashboard-hero";
import { WorshipScheduleBanner } from "@/components/dashboard/my-schedule/worship-schedule-banner";
import { DashboardMetricCard } from "@/components/dashboard/home/dashboard-metric-card";
import { StaggerItem, StaggerList } from "@/components/motion/dashboard-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useChurchEvents,
  useDashboardSummary,
  useMinistries,
  usePasswordResetRequests,
  usePendingAccessUsers,
} from "@/lib/api/queries";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { collapseRecurringEventsForList, isUpcomingInCurrentMonth } from "@/lib/events/list";
import { formatRelativeEventDay } from "@/lib/dashboard/date-utils";
import {
  canAccessActivities,
  canAccessMembers,
  canAccessSchedules,
  canCreateAnyActivity,
  canListMinistries,
  canManageMinistries,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEvent } from "@/types/events";

function sortUpcomingEvents(events: ChurchEvent[]): ChurchEvent[] {
  return collapseRecurringEventsForList(events);
}

export function DashboardHomeContent() {
  const { user, church, permissions } = useAuth();
  const [createActivityOpen, setCreateActivityOpen] = useState(false);

  const canAccessMembersData = canAccessMembers(permissions);
  const canAccessActivitiesData = canAccessActivities(permissions);
  const canAccessSchedulesData = canAccessSchedules(permissions);
  const canListMinistriesData = canListMinistries(permissions);
  const canManageMemberships = canManageChurchMemberships(permissions);
  const canCreateActivity = permissions
    ? canCreateAnyActivity(permissions)
    : false;

  const { data: summary, isLoading: summaryLoading, isError } =
    useDashboardSummary();
  const { data: events, isLoading: eventsLoading } = useChurchEvents(
    {},
    { enabled: canAccessActivitiesData },
  );
  const { data: ministries } = useMinistries({
    enabled: canListMinistriesData,
  });
  const { data: pendingAccess } = usePendingAccessUsers({
    enabled: canManageMemberships,
  });
  const { data: passwordResets } = usePasswordResetRequests({
    poll: canManageMemberships,
  });

  const upcomingEvents = useMemo(
    () => sortUpcomingEvents(events ?? []),
    [events],
  );

  const upcomingEventsThisMonth = useMemo(
    () =>
      upcomingEvents.filter((event) => isUpcomingInCurrentMonth(event.startsAt)),
    [upcomingEvents],
  );

  const nextEvent = canAccessActivitiesData ? (upcomingEvents[0] ?? null) : null;
  const nextEventThisMonth = canAccessActivitiesData
    ? (upcomingEventsThisMonth[0] ?? null)
    : null;
  const activeMinistries =
    ministries?.filter((ministry) => ministry.isActive).length ?? 0;

  const visitorCount =
    canAccessMembersData && summary?.memberCount != null && summary.activeMembers != null
      ? Math.max(0, summary.memberCount - summary.activeMembers)
      : 0;
  const activeRate =
    canAccessMembersData &&
    summary?.memberCount != null &&
    summary.activeMembers != null &&
    summary.memberCount > 0
      ? Math.round((summary.activeMembers / summary.memberCount) * 100)
      : 0;

  const nextEventHint = nextEventThisMonth
    ? formatRelativeEventDay(nextEventThisMonth.startsAt) ?? nextEventThisMonth.name
    : "Nenhuma agendada";

  const knownMinistryNames = useMemo(() => {
    const names: Record<string, string> = {};

    for (const event of events ?? []) {
      if (event.ministryId && event.ministryName) {
        names[event.ministryId] = event.ministryName;
      }
    }

    return names;
  }, [events]);

  const metricCards = useMemo(() => {
    const cards: Array<{
      key: string;
      label: string;
      value: string;
      hint: string;
      href: string;
      icon: typeof Users;
      accent: "emerald" | "sky" | "amber" | "violet";
    }> = [];

    if (canAccessMembersData) {
      cards.push({
        key: "member-count",
        label: "Membros cadastrados",
        value: String(summary?.memberCount ?? 0),
        hint:
          visitorCount > 0
            ? `${visitorCount} visitante${visitorCount > 1 ? "s" : ""} no cadastro`
            : "Total na igreja",
        href: AUTH_ROUTES.members,
        icon: Users,
        accent: "emerald",
      });
      cards.push({
        key: "active-members",
        label: "Membros ativos",
        value: String(summary?.activeMembers ?? 0),
        hint: `${activeRate}% do cadastro`,
        href: AUTH_ROUTES.members,
        icon: UserCheck,
        accent: "sky",
      });
    }

    if (canAccessActivitiesData) {
      cards.push({
        key: "upcoming-events",
        label: "Próximas atividades do mês",
        value: String(upcomingEventsThisMonth.length),
        hint: nextEventHint,
        href: AUTH_ROUTES.activities,
        icon: CalendarDays,
        accent: "amber",
      });
    }

    if (canListMinistriesData) {
      cards.push({
        key: "active-ministries",
        label: "Ministérios e grupos ativos",
        value: String(activeMinistries),
        hint:
          activeMinistries > 0
            ? "Áreas de serviço em operação"
            : "Configure equipes e cargos",
        href: AUTH_ROUTES.ministries,
        icon: Layers,
        accent: "violet",
      });
    }

    return cards;
  }, [
    activeMinistries,
    activeRate,
    canAccessActivitiesData,
    canAccessMembersData,
    canListMinistriesData,
    nextEventHint,
    summary?.activeMembers,
    summary?.memberCount,
    upcomingEventsThisMonth.length,
    visitorCount,
  ]);

  const showActionsPanel = Boolean(
    permissions &&
      (canManageMemberships ||
        canCreateActivity ||
        canAccessMembersData ||
        canManageMinistries(permissions) ||
        permissions.finances.access),
  );

  if (!user || !church) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        <DashboardHero
          userName={user.name}
          churchName={church.name}
          nextEvent={nextEvent}
          canCreateActivity={canCreateActivity}
          canAccessMembers={canAccessMembersData}
          canAccessActivities={canAccessActivitiesData}
          onCreateActivity={() => setCreateActivityOpen(true)}
        />

        {canAccessSchedulesData ? <WorshipScheduleBanner /> : null}

        {metricCards.length > 0 ? (
          <StaggerList
            className={cn(
              "grid gap-4 sm:grid-cols-2",
              metricCards.length >= 4 && "xl:grid-cols-4",
              metricCards.length === 3 && "xl:grid-cols-3",
              metricCards.length === 1 && "sm:grid-cols-1",
            )}
          >
            {summaryLoading
              ? Array.from({ length: metricCards.length }).map((_, index) => (
                  <Skeleton key={index} className="h-[8.5rem] rounded-2xl" />
                ))
              : metricCards.map((card) => (
                  <StaggerItem key={card.key}>
                    <DashboardMetricCard
                      label={card.label}
                      value={card.value}
                      hint={card.hint}
                      href={card.href}
                      icon={card.icon}
                      accent={card.accent}
                    />
                  </StaggerItem>
                ))}
          </StaggerList>
        ) : null}

        {(canAccessActivitiesData || showActionsPanel) && (
          <div
            className={cn(
              "grid gap-6",
              canAccessActivitiesData && showActionsPanel
                ? "xl:grid-cols-[minmax(0,1fr)_20rem]"
                : undefined,
            )}
          >
            {canAccessActivitiesData ? (
              <DashboardEventsPanel
                events={upcomingEvents}
                isLoading={eventsLoading}
                canCreateActivity={canCreateActivity}
                onCreateActivity={() => setCreateActivityOpen(true)}
              />
            ) : null}

            {showActionsPanel ? (
              <DashboardActionsPanel
                pendingAccessCount={pendingAccess?.length ?? 0}
                passwordResetCount={passwordResets?.length ?? 0}
                onCreateActivity={() => setCreateActivityOpen(true)}
              />
            ) : null}
          </div>
        )}

        {isError && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
            Não foi possível carregar o resumo. Verifique se o backend está
            rodando.
          </p>
        )}
      </div>

      {canCreateActivity && (
        <CreateActivityModal
          open={createActivityOpen}
          onClose={() => setCreateActivityOpen(false)}
          knownMinistryNames={knownMinistryNames}
        />
      )}
    </>
  );
}
