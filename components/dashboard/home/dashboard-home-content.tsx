"use client";

import { useMemo, useState } from "react";

import { CreateActivityModal } from "@/components/dashboard/activities/create-activity-modal";
import { DashboardQuickActions } from "@/components/dashboard/home/dashboard-actions-panel";
import { DashboardAnnouncementsPanel } from "@/components/dashboard/home/dashboard-announcements-panel";
import { DashboardEventsPanel } from "@/components/dashboard/home/dashboard-events-panel";
import { DashboardHero } from "@/components/dashboard/home/dashboard-hero";
import { DashboardPriorities } from "@/components/dashboard/home/dashboard-priorities";
import { DashboardWeekPulse } from "@/components/dashboard/home/dashboard-week-pulse";
import { WorshipScheduleBanner } from "@/components/dashboard/my-schedule/worship-schedule-banner";
import {
  StaggerItem,
  StaggerList,
} from "@/components/motion/dashboard-motion";
import {
  useAnnouncements,
  useAnnouncementsUnreadCount,
  useCareInboxPendingCount,
  useChurchEvents,
  useMySchedules,
  usePasswordResetRequests,
  usePendingAccessUsers,
} from "@/lib/api/queries";
import { canManageChurchMemberships } from "@/lib/church-memberships/constants";
import { resolveDashboardHomeProfile } from "@/lib/dashboard/home-profile";
import { buildDashboardPriorities } from "@/lib/dashboard/priority-items";
import { collapseRecurringEventsForList } from "@/lib/events/list";
import {
  canAccessActivities,
  canAccessMembers,
  canAccessSchedules,
  canCreateAnyActivity,
  canListMinistries,
  canManageCommunication,
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

  const profile = resolveDashboardHomeProfile({
    isOwner: Boolean(user?.isOwner),
    permissions,
  });

  const canAccessMembersData = canAccessMembers(permissions);
  const canAccessActivitiesData = canAccessActivities(permissions);
  const canAccessSchedulesData = canAccessSchedules(permissions);
  const canManageMemberships = canManageChurchMemberships(permissions);
  const hasCommunicationAccess = Boolean(permissions?.communication.access);
  const canPublishCommunication = canManageCommunication(
    permissions,
    Boolean(user?.isOwner),
  );
  const canCreateActivity = permissions
    ? canCreateAnyActivity(permissions)
    : false;
  const canReceiveCare =
    Boolean(user?.isOwner) || Boolean(permissions?.counseling?.receive);

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
  const { data: announcementsUnread } = useAnnouncementsUnreadCount({
    enabled: hasCommunicationAccess,
  });
  const { data: schedule } = useMySchedules({
    enabled: canAccessSchedulesData,
  });
  const { data: carePending } = useCareInboxPendingCount({
    enabled: canReceiveCare,
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
    () => (announcements ?? []).slice(0, profile === "member" ? 3 : 4),
    [announcements, profile],
  );

  const schedulePendingCount = schedule?.summary.pendingAvailabilityCount ?? 0;
  const carePendingCount = canReceiveCare ? (carePending?.count ?? 0) : 0;
  const announcementsUnreadCount =
    typeof announcementsUnread === "number" ? announcementsUnread : 0;

  const priorities = useMemo(
    () =>
      buildDashboardPriorities({
        profile,
        pendingAccessCount: pendingAccess?.length ?? 0,
        passwordResetCount: passwordResets?.length ?? 0,
        schedulePendingCount,
        carePendingCount,
        announcementsUnreadCount,
        nextEvent,
        canManageMemberships,
        canAccessSchedules: canAccessSchedulesData,
        canReceiveCare,
        hasCommunicationAccess,
        canAccessActivities: canAccessActivitiesData,
      }),
    [
      profile,
      pendingAccess?.length,
      passwordResets?.length,
      schedulePendingCount,
      carePendingCount,
      announcementsUnreadCount,
      nextEvent,
      canManageMemberships,
      canAccessSchedulesData,
      canReceiveCare,
      hasCommunicationAccess,
      canAccessActivitiesData,
    ],
  );

  const showQuickActions = Boolean(
    permissions &&
      (canManageMemberships ||
        canCreateActivity ||
        canAccessMembersData ||
        canListMinistries(permissions) ||
        permissions.finances.access ||
        hasCommunicationAccess ||
        canReceiveCare ||
        canAccessSchedulesData),
  );

  const showWeekPulse =
    (profile === "owner" || profile === "leader") && canAccessActivitiesData;

  const showEventsPanel =
    canAccessActivitiesData && (profile === "owner" || profile === "leader");

  const showAnnouncementsPanel = hasCommunicationAccess;

  const showMainGrid = showEventsPanel || showAnnouncementsPanel;

  const showScheduleBanner =
    canAccessSchedulesData &&
    (profile === "member" || schedulePendingCount > 0);

  if (!user || !church) {
    return null;
  }

  return (
    <>
      <StaggerList className="space-y-7">
        <StaggerItem>
          <DashboardHero
            userName={user.name}
            churchName={church.name}
            profile={profile}
          />
        </StaggerItem>

        <StaggerItem>
          <div
            className={cn(
              "grid gap-4",
              showWeekPulse ? "xl:grid-cols-2 xl:items-stretch" : undefined,
            )}
          >
            <DashboardPriorities items={priorities} />
            {showWeekPulse ? (
              <DashboardWeekPulse
                variant="chart"
                events={upcomingEvents}
                canAccessActivities
              />
            ) : null}
          </div>
        </StaggerItem>

        {showQuickActions ? (
          <StaggerItem>
            <DashboardQuickActions
              profile={profile}
              onCreateActivity={() => setCreateActivityOpen(true)}
              carePendingCount={carePendingCount}
              schedulePendingCount={schedulePendingCount}
            />
          </StaggerItem>
        ) : null}

        {showMainGrid ? (
          <StaggerItem>
            <div
              className={cn(
                "grid gap-6",
                showEventsPanel && showAnnouncementsPanel
                  ? "xl:grid-cols-2"
                  : undefined,
              )}
            >
              {showEventsPanel ? (
                <DashboardEventsPanel
                  events={upcomingEvents}
                  isLoading={eventsLoading}
                  canCreateActivity={canCreateActivity}
                  onCreateActivity={() => setCreateActivityOpen(true)}
                />
              ) : null}

              {showAnnouncementsPanel ? (
                <DashboardAnnouncementsPanel
                  announcements={recentAnnouncements}
                  canPublish={canPublishCommunication}
                />
              ) : null}
            </div>
          </StaggerItem>
        ) : null}

        {showScheduleBanner ? (
          <StaggerItem>
            <WorshipScheduleBanner />
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
