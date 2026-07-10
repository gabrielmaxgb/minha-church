import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { announcementsKeys } from "@/lib/api/queries/announcements.keys";
import { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
import { churchRolesKeys } from "@/lib/api/queries/church-roles.keys";
import { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
import { eventsKeys } from "@/lib/api/queries/events.keys";
import { membersKeys } from "@/lib/api/queries/members.keys";
import { membershipsKeys } from "@/lib/api/queries/memberships.keys";
import { ministriesKeys } from "@/lib/api/queries/ministries.keys";
import { billingKeys } from "@/lib/api/queries/billing.keys";
import { pricingKeys } from "@/lib/api/queries/pricing.keys";
import { rosterKeys } from "@/lib/api/queries/roster.keys";

export const queries = mergeQueryKeys(
  pricingKeys,
  billingKeys,
  dashboardKeys,
  eventsKeys,
  membersKeys,
  membershipsKeys,
  ministriesKeys,
  rosterKeys,
  churchRolesKeys,
  auditLogsKeys,
  announcementsKeys,
);

export { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
export { eventsKeys } from "@/lib/api/queries/events.keys";
export { membersKeys } from "@/lib/api/queries/members.keys";
export { membershipsKeys } from "@/lib/api/queries/memberships.keys";
export { ministriesKeys } from "@/lib/api/queries/ministries.keys";
export { pricingKeys } from "@/lib/api/queries/pricing.keys";
export { useChurchEvent, useChurchEvents, useEventSeriesOccurrences } from "@/lib/api/queries/use-church-events";
export {
	useCreateChurchEvent,
	useDeleteChurchEvent,
	useRemoveEventRoster,
	useSetEventRosterCollection,
	useUpdateChurchEvent,
	useUpdateChurchEventAvailability,
	useUpsertEventRoster,
} from "@/lib/api/queries/use-event-mutations";
export { useDashboardSummary } from "@/lib/api/queries/use-dashboard-summary";
export { useAckMinistryCatalogNotifications, useMember, useMembers, useMembersInfinite, useMyMember, useMyMinistryNotifications, useReceiveMember } from "@/lib/api/queries/use-members";
export {
  useCreateMember,
  useDeleteMember,
  useUpdateMember,
} from "@/lib/api/queries/use-member-mutations";
export { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
export { useAuditLogs } from "@/lib/api/queries/use-audit-logs";
export { announcementsKeys } from "@/lib/api/queries/announcements.keys";
export {
  useAnnouncements,
  useAnnouncementsUnreadCount,
  useManagedAnnouncements,
} from "@/lib/api/queries/use-announcements";
export {
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useMarkAllAnnouncementsRead,
  useMarkAnnouncementRead,
  useUpdateAnnouncement,
} from "@/lib/api/queries/use-announcement-mutations";
export { churchRolesKeys } from "@/lib/api/queries/church-roles.keys";
export { useChurchRoles } from "@/lib/api/queries/use-church-roles";
export {
  useCreateChurchRole,
  useDeleteChurchRole,
  useUpdateChurchRole,
} from "@/lib/api/queries/use-church-role-mutations";
export { useChurchMemberships, useAssignableRoles, usePasswordResetRequests, usePendingAccessUsers } from "@/lib/api/queries/use-church-memberships";
export { useResetMemberPassword } from "@/lib/api/queries/use-reset-member-password";
export {
  useTransferChurchOwnership,
  useUpdateChurchMembership,
} from "@/lib/api/queries/use-membership-mutations";
export {
  useMinistries,
  useMinistry,
  useMinistryEvents,
  useMinistryMembers,
  useRosterProfile,
  useWorshipProfile,
} from "@/lib/api/queries/use-ministries";
export {
  useAssignMemberToMinistry,
  useAssignMembersToMinistry,
  useMemberMinistryAssignment,
  useMemberMinistryRemoval,
  useRemoveMemberFromMinistry,
  useUpdateMemberMinistryRole,
} from "@/lib/api/queries/use-member-ministry-mutations";
export {
  useCreateMinistry,
  useCreateMinistryEvent,
  useCreateMinistryRole,
  useDeleteMinistry,
  useDeleteMinistryRole,
  useSetRosterCollection,
  useUpdateEventAvailability,
  useUpdateEventRoleProfile,
  useUpdateMinistry,
  useUpdateMinistryRole,
  useUpdateRosterProfile,
  useUpdateWorshipProfile,
  useReplaceMinistryServiceFunctions,
  useUpdateMemberMinistryInstruments,
} from "@/lib/api/queries/use-ministry-mutations";
export { usePricing } from "@/lib/api/queries/use-pricing";
export {
  useBillingPortal,
  useSubscriptionSummary,
} from "@/lib/api/queries/use-billing";
export { rosterKeys, worshipKeys } from "@/lib/api/queries/roster.keys";
export { useMySchedules, useMyWorshipSchedule } from "@/lib/api/queries/use-my-schedules";
export {
  useRespondToRosterAvailability,
  useRespondToWorshipAvailability,
} from "@/lib/api/queries/use-respond-worship-availability";
