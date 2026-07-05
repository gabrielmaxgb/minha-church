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
import { collapseRecurringEventsForList } from "@/lib/events/list";
import { formatRelativeEventDay } from "@/lib/dashboard/date-utils";
import { canCreateAnyActivity, canListMinistries } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEvent } from "@/types/events";

function sortUpcomingEvents(events: ChurchEvent[]): ChurchEvent[] {
  return collapseRecurringEventsForList(events);
}

export function DashboardHomeContent() {
  const { user, church, permissions } = useAuth();
  const [createActivityOpen, setCreateActivityOpen] = useState(false);

  const { data: summary, isLoading: summaryLoading, isError } =
    useDashboardSummary();
  const { data: events, isLoading: eventsLoading } = useChurchEvents();
  const canListMinistriesData = canListMinistries(permissions);
  const { data: ministries } = useMinistries({
    enabled: canListMinistriesData,
  });

  const canManageMemberships = canManageChurchMemberships(permissions);
  const { data: pendingAccess } = usePendingAccessUsers();
  const { data: passwordResets } = usePasswordResetRequests({
    poll: canManageMemberships,
  });

  const upcomingEvents = useMemo(
    () => sortUpcomingEvents(events ?? []),
    [events],
  );

  const nextEvent = upcomingEvents[0] ?? null;
  const activeMinistries =
    ministries?.filter((ministry) => ministry.isActive).length ?? 0;

  const visitorCount = Math.max(
    0,
    (summary?.memberCount ?? 0) - (summary?.activeMembers ?? 0),
  );
  const activeRate =
    summary && summary.memberCount > 0
      ? Math.round((summary.activeMembers / summary.memberCount) * 100)
      : 0;

  const nextEventHint = nextEvent
    ? formatRelativeEventDay(nextEvent.startsAt) ?? nextEvent.name
    : "Nenhuma agendada";

  const canCreateActivity = permissions
    ? canCreateAnyActivity(permissions)
    : false;

  const knownMinistryNames = useMemo(() => {
    const names: Record<string, string> = {};

    for (const event of events ?? []) {
      if (event.ministryId && event.ministryName) {
        names[event.ministryId] = event.ministryName;
      }
    }

    return names;
  }, [events]);

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
          onCreateActivity={() => setCreateActivityOpen(true)}
        />

        <WorshipScheduleBanner />

        <StaggerList className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryLoading ? (
            Array.from({
              length: canListMinistriesData ? 4 : 3,
            }).map((_, index) => (
              <Skeleton key={index} className="h-[8.5rem] rounded-2xl" />
            ))
          ) : (
            <>
              <StaggerItem>
                <DashboardMetricCard
                  label="Membros cadastrados"
                  value={String(summary?.memberCount ?? 0)}
                  hint={
                    visitorCount > 0
                      ? `${visitorCount} visitante${visitorCount > 1 ? "s" : ""} no cadastro`
                      : "Total na igreja"
                  }
                  href={AUTH_ROUTES.members}
                  icon={Users}
                  accent="emerald"
                />
              </StaggerItem>
              <StaggerItem>
                <DashboardMetricCard
                  label="Membros ativos"
                  value={String(summary?.activeMembers ?? 0)}
                  hint={`${activeRate}% do cadastro`}
                  href={AUTH_ROUTES.members}
                  icon={UserCheck}
                  accent="sky"
                />
              </StaggerItem>
              <StaggerItem>
                <DashboardMetricCard
                  label="Próximas atividades"
                  value={String(
                    summary?.upcomingEvents ?? upcomingEvents.length,
                  )}
                  hint={nextEventHint}
                  href={AUTH_ROUTES.activities}
                  icon={CalendarDays}
                  accent="amber"
                />
              </StaggerItem>
              {canListMinistriesData && (
                <StaggerItem>
                  <DashboardMetricCard
                    label="Ministérios ativos"
                    value={String(activeMinistries)}
                    hint={
                      activeMinistries > 0
                        ? "Áreas de serviço em operação"
                        : "Configure equipes e cargos"
                    }
                    href={AUTH_ROUTES.ministries}
                    icon={Layers}
                    accent="violet"
                  />
                </StaggerItem>
              )}
            </>
          )}
        </StaggerList>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <DashboardEventsPanel
            events={upcomingEvents}
            isLoading={eventsLoading}
            canCreateActivity={canCreateActivity}
            onCreateActivity={() => setCreateActivityOpen(true)}
          />

          <DashboardActionsPanel
            pendingAccessCount={pendingAccess?.length ?? 0}
            passwordResetCount={passwordResets?.length ?? 0}
            onCreateActivity={() => setCreateActivityOpen(true)}
          />
        </div>

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
