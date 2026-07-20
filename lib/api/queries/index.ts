import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { announcementsKeys } from "@/lib/api/queries/announcements.keys";
import { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
import { careRequestsKeys } from "@/lib/api/queries/care-requests.keys";
import { churchRolesKeys } from "@/lib/api/queries/church-roles.keys";
import { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
import { eventsKeys } from "@/lib/api/queries/events.keys";
import { membersKeys } from "@/lib/api/queries/members.keys";
import { membershipsKeys } from "@/lib/api/queries/memberships.keys";
import { ministriesKeys } from "@/lib/api/queries/ministries.keys";
import { billingKeys } from "@/lib/api/queries/billing.keys";
import { notificationsKeys } from "@/lib/api/queries/notifications.keys";
import { paymentsKeys } from "@/lib/api/queries/payments.keys";
import { prayerRequestsKeys } from "@/lib/api/queries/prayer-requests.keys";
import { pricingKeys } from "@/lib/api/queries/pricing.keys";
import { rosterKeys } from "@/lib/api/queries/roster.keys";

export const queries = mergeQueryKeys(
  pricingKeys,
  billingKeys,
  paymentsKeys,
  dashboardKeys,
  eventsKeys,
  membersKeys,
  membershipsKeys,
  ministriesKeys,
  rosterKeys,
  churchRolesKeys,
  auditLogsKeys,
  announcementsKeys,
  careRequestsKeys,
  prayerRequestsKeys,
  notificationsKeys,
);

export { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
export { eventsKeys } from "@/lib/api/queries/events.keys";
export { membersKeys } from "@/lib/api/queries/members.keys";
export { membershipsKeys } from "@/lib/api/queries/memberships.keys";
export { ministriesKeys } from "@/lib/api/queries/ministries.keys";
export { pricingKeys } from "@/lib/api/queries/pricing.keys";
export {
  useChurchEvent,
  useChurchEvents,
  useEventSeriesOccurrences,
  useEventTicketRegistrations,
} from "@/lib/api/queries/use-church-events";
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
export { useAckMinistryCatalogNotifications, useMember, useMembers, useMembersInfinite, useMyMember, useMyMinistryNotifications, useReceiveMember, useRecordParentalConsent, useRevokeParentalConsent } from "@/lib/api/queries/use-members";
export { useCreateFamily, useFamilies } from "@/lib/api/queries/use-families";
export {
  useCreateMemberRelation,
  useDeleteMemberRelation,
  useFamilyGraph,
  useSetMemberFamily,
} from "@/lib/api/queries/use-family-graph";
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
  useBillingInvoices,
  useBillingPortal,
  useSubscriptionSummary,
} from "@/lib/api/queries/use-billing";
export { paymentsKeys } from "@/lib/api/queries/payments.keys";
export {
  resolvePaymentsError,
  useConnectStatus,
  useConnectPayoutsOverview,
  useCreateFinanceEntry,
  useCreateGivingFund,
  useCreateMemberGivingCheckout,
  useDeleteFinanceEntry,
  useDeleteGivingFund,
  useExportFinanceEntries,
  useExportGivingDonations,
  useExportEventTicketPurchases,
  useFinanceEntries,
  useFinanceEntriesSummary,
  useFiscalProfile,
  useGivingDonations,
  useEventTicketPurchases,
  useMyGivingDonations,
  useMyGivingSubscriptions,
  useCancelMyGivingSubscription,
  useGivingSubscriptions,
  useCancelGivingSubscriptionAsTreasurer,
  useGivingFunds,
  useMemberGivingFunds,
  usePaymentsSummary,
  useRefundGivingDonation,
  useRefundEventTicketPurchase,
  useOpenExpressDashboard,
  useResumeConnectOnboarding,
  useStartConnectOnboarding,
  useSyncConnectAccount,
  useUpdateFinanceEntry,
  useUpdateGivingFund,
  useUpsertFiscalProfile,
} from "@/lib/api/queries/use-payments";
export { treasuryKeys } from "@/lib/api/queries/treasury.keys";
export {
  resolveTreasuryError,
  useCloseFinancialPeriod,
  useCreateFinanceAccount,
  useDeleteFinanceAccount,
  useExportFinancialReport,
  useFinanceAccounts,
  useFinancialPeriodStatus,
  useFinancialReport,
  useReopenFinancialPeriod,
  useUpdateFinanceAccount,
} from "@/lib/api/queries/use-treasury";
export { rosterKeys, worshipKeys } from "@/lib/api/queries/roster.keys";
export { useMySchedules, useMyWorshipSchedule } from "@/lib/api/queries/use-my-schedules";
export {
  useRespondToRosterAvailability,
  useRespondToWorshipAvailability,
} from "@/lib/api/queries/use-respond-worship-availability";
export { careRequestsKeys } from "@/lib/api/queries/care-requests.keys";
export {
  useAckCareViewedMine,
  useCareInbox,
  useCareInboxPendingCount,
  useCareRecipients,
  useCareViewedMineCount,
  useCreateCareRequest,
  useMarkCareRequestViewed,
  useMyCareRequests,
} from "@/lib/api/queries/use-care-requests";
export { prayerRequestsKeys } from "@/lib/api/queries/prayer-requests.keys";
export {
  useArchivePrayerRequest,
  useCreatePrayerRequest,
  useDeletePrayerRequest,
  usePrayerRequests,
  useTogglePrayerRequestPray,
} from "@/lib/api/queries/use-prayer-requests";
export { pastoralNotesKeys } from "@/lib/api/queries/pastoral-notes.keys";
export {
  resolvePastoralNotesError,
  useCreatePastoralNote,
  useDeletePastoralNote,
  useMemberPastoralNotes,
  usePastoralCareSummary,
  useUpdatePastoralNote,
} from "@/lib/api/queries/use-pastoral-notes";
export { notificationsKeys } from "@/lib/api/queries/notifications.keys";
export {
  useMarkNotificationRead,
  useNotificationInbox,
} from "@/lib/api/queries/use-notifications";
