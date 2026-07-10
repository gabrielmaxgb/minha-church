"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { CreateActivityModal } from "@/components/dashboard/activities/create-activity-modal";
import { DashboardActionsPanel } from "@/components/dashboard/home/dashboard-actions-panel";
import { DashboardEventsPanel } from "@/components/dashboard/home/dashboard-events-panel";
import { DashboardHero } from "@/components/dashboard/home/dashboard-hero";
import { DashboardWeekPulse } from "@/components/dashboard/home/dashboard-week-pulse";
import { WorshipScheduleBanner } from "@/components/dashboard/my-schedule/worship-schedule-banner";
import {
  StaggerItem,
  StaggerList,
} from "@/components/motion/dashboard-motion";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  useAnnouncements,
  useChurchEvents,
  useMySchedules,
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
  const { data: schedule } = useMySchedules({
    enabled: canAccessSchedulesData,
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
    () => (announcements ?? []).slice(0, 4),
    [announcements],
  );

  const pendingAttentionCount =
    (pendingAccess?.length ?? 0) + (passwordResets?.length ?? 0);
  const schedulePendingCount = schedule?.summary.pendingAvailabilityCount ?? 0;

  const showActionsPanel = Boolean(
    permissions &&
      (canManageMemberships ||
        canCreateActivity ||
        canAccessMembersData ||
        canManageMinistries(permissions) ||
        permissions.finances.access),
  );

  const showWeekPulse =
    canAccessActivitiesData ||
    canAccessMembersData ||
    pendingAttentionCount > 0 ||
    schedulePendingCount > 0;

  if (!user || !church) {
    return null;
  }

  return (
    <>
      <StaggerList className="space-y-8">
        <StaggerItem>
          <DashboardHero
            userName={user.name}
            churchName={church.name}
            nextEvent={nextEvent}
            canCreateActivity={canCreateActivity}
            canAccessMembers={canAccessMembersData}
            canAccessActivities={canAccessActivitiesData}
            onCreateActivity={() => setCreateActivityOpen(true)}
          />
        </StaggerItem>

        {showWeekPulse ? (
          <StaggerItem>
            <DashboardWeekPulse
              events={canAccessActivitiesData ? upcomingEvents : []}
              memberCount={church.memberCount}
              pendingAttentionCount={pendingAttentionCount}
              schedulePendingCount={schedulePendingCount}
              canAccessMembers={canAccessMembersData}
              canAccessSchedules={canAccessSchedulesData}
              canAccessActivities={canAccessActivitiesData}
            />
          </StaggerItem>
        ) : null}

        {canAccessSchedulesData ? (
          <StaggerItem>
            <WorshipScheduleBanner />
          </StaggerItem>
        ) : null}

        <StaggerItem>
          <div
            className={cn(
              "grid gap-6",
              canAccessActivitiesData && showActionsPanel
                ? "xl:grid-cols-[minmax(0,1fr)_17rem]"
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
        </StaggerItem>

        {hasCommunicationAccess ? (
          <StaggerItem>
            <section className="rounded-xl border border-domain-communication/20 bg-gradient-to-br from-domain-communication-subtle/70 via-card to-card">
              <div className="flex flex-col gap-2 border-b border-domain-communication/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-sm font-medium text-domain-communication-foreground">
                    Comunicação recente
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Avisos publicados para a igreja
                  </p>
                </div>
                <Link
                  href={AUTH_ROUTES.communication}
                  className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ver tudo
                </Link>
              </div>
              {recentAnnouncements.length === 0 ? (
                <div className="px-4 py-6">
                  <p className="text-sm text-muted-foreground">
                    Nenhum comunicado recente.
                  </p>
                  <Link
                    href={AUTH_ROUTES.communication}
                    className="mt-2 inline-flex text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
                  >
                    Publicar aviso
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border/70">
                  {recentAnnouncements.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={AUTH_ROUTES.communication}
                        className="block px-4 py-3 transition-colors hover:bg-domain-communication-subtle/40"
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
          </StaggerItem>
        ) : null}
      </StaggerList>

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
