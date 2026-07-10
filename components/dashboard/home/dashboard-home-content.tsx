"use client";

import { useMemo, useState } from "react";

import { CreateActivityModal } from "@/components/dashboard/activities/create-activity-modal";
import { DashboardActionsPanel } from "@/components/dashboard/home/dashboard-actions-panel";
import { DashboardEventsPanel } from "@/components/dashboard/home/dashboard-events-panel";
import { DashboardHero } from "@/components/dashboard/home/dashboard-hero";
import { DashboardMetricCard } from "@/components/dashboard/home/dashboard-metric-card";
import { WorshipScheduleBanner } from "@/components/dashboard/my-schedule/worship-schedule-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useAnnouncements,
  useChurchEvents,
  useDashboardSummary,
  usePasswordResetRequests,
  usePendingAccessUsers,
} from "@/lib/api/queries";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { collapseRecurringEventsForList } from "@/lib/events/list";
import {
  canAccessActivities,
  canAccessMembers,
  canAccessSchedules,
  canCreateAnyActivity,
  canManageMinistries,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEvent } from "@/types/events";
import Link from "next/link";

function sortUpcomingEvents(events: ChurchEvent[]): ChurchEvent[] {
  return collapseRecurringEventsForList(events);
}

export function DashboardHomeContent() {
  const { user, church, permissions } = useAuth();
  const [createActivityOpen, setCreateActivityOpen] = useState(false);

  const canAccessMembersData = canAccessMembers(permissions);
  const canAccessActivitiesData = canAccessActivities(permissions);
  const canAccessSchedulesData = canAccessSchedules(permissions);
  const canManageMemberships = canManageChurchMemberships(permissions);
  const hasCommunicationAccess = Boolean(permissions?.communication.access);
  const canCreateActivity = permissions
    ? canCreateAnyActivity(permissions)
    : false;

  const { data: summary, isLoading: summaryLoading, isError } =
    useDashboardSummary();
  const { data: events, isLoading: eventsLoading } = useChurchEvents(
    {},
    { enabled: canAccessActivitiesData },
  );
  const { data: pendingAccess } = usePendingAccessUsers({
    enabled: canManageMemberships,
  });
  const { data: passwordResets } = usePasswordResetRequests({
    poll: canManageMemberships,
  });
  const { data: announcements } = useAnnouncements({
    enabled: hasCommunicationAccess,
  });

  const upcomingEvents = useMemo(
    () => sortUpcomingEvents(events ?? []),
    [events],
  );

  const nextEvent = canAccessActivitiesData ? (upcomingEvents[0] ?? null) : null;

  const knownMinistryNames = useMemo(() => {
    const names: Record<string, string> = {};

    for (const event of events ?? []) {
      if (event.ministryId && event.ministryName) {
        names[event.ministryId] = event.ministryName;
      }
    }

    return names;
  }, [events]);

  const recentAnnouncements = useMemo(
    () => (announcements ?? []).slice(0, 3),
    [announcements],
  );

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
      <div className="space-y-8">
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

        <div
          className={cn(
            "grid gap-6",
            canAccessActivitiesData && showActionsPanel
              ? "xl:grid-cols-[minmax(0,1fr)_18rem]"
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

        <div
          className={cn(
            "grid gap-6",
            canAccessMembersData && hasCommunicationAccess
              ? "md:grid-cols-2"
              : undefined,
          )}
        >
          {canAccessMembersData ? (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  Crescimento
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Cadastro pastoral — abra a lista para agir
                </p>
              </div>
              {summaryLoading ? (
                <Skeleton className="h-24 rounded-lg" />
              ) : (
                <DashboardMetricCard
                  label="Membros ativos"
                  value={String(summary?.activeMembers ?? 0)}
                  hint={
                    summary?.memberCount != null
                      ? `${summary.memberCount} no cadastro total`
                      : undefined
                  }
                  href={AUTH_ROUTES.members}
                />
              )}
            </section>
          ) : null}

          {hasCommunicationAccess ? (
            <section className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-medium text-foreground">
                    Comunicação
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Avisos recentes
                  </p>
                </div>
                <Link
                  href={AUTH_ROUTES.communication}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ver tudo
                </Link>
              </div>
              {recentAnnouncements.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  Nenhum comunicado recente.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {recentAnnouncements.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={AUTH_ROUTES.communication}
                        className="block px-4 py-3 transition-colors hover:bg-muted/40"
                      >
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.body}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>

        {isError && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
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
