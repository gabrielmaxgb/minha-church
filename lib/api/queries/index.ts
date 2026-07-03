import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
import { churchRolesKeys } from "@/lib/api/queries/church-roles.keys";
import { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
import { eventsKeys } from "@/lib/api/queries/events.keys";
import { membersKeys } from "@/lib/api/queries/members.keys";
import { membershipsKeys } from "@/lib/api/queries/memberships.keys";
import { ministriesKeys } from "@/lib/api/queries/ministries.keys";
import { pricingKeys } from "@/lib/api/queries/pricing.keys";

export const queries = mergeQueryKeys(
  pricingKeys,
  dashboardKeys,
  eventsKeys,
  membersKeys,
  membershipsKeys,
  ministriesKeys,
  churchRolesKeys,
  auditLogsKeys,
);

export { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
export { eventsKeys } from "@/lib/api/queries/events.keys";
export { membersKeys } from "@/lib/api/queries/members.keys";
export { membershipsKeys } from "@/lib/api/queries/memberships.keys";
export { ministriesKeys } from "@/lib/api/queries/ministries.keys";
export { pricingKeys } from "@/lib/api/queries/pricing.keys";
export { useChurchEvent, useChurchEvents } from "@/lib/api/queries/use-church-events";
export { useCreateChurchEvent, useDeleteChurchEvent, useUpdateChurchEvent } from "@/lib/api/queries/use-event-mutations";
export { useDashboardSummary } from "@/lib/api/queries/use-dashboard-summary";
export { useMember, useMembers, useMembersInfinite, useReceiveMember } from "@/lib/api/queries/use-members";
export {
  useCreateMember,
  useDeleteMember,
  useUpdateMember,
} from "@/lib/api/queries/use-member-mutations";
export { auditLogsKeys } from "@/lib/api/queries/audit-logs.keys";
export { useAuditLogs } from "@/lib/api/queries/use-audit-logs";
export { churchRolesKeys } from "@/lib/api/queries/church-roles.keys";
export { useChurchRoles } from "@/lib/api/queries/use-church-roles";
export {
  useCreateChurchRole,
  useDeleteChurchRole,
  useUpdateChurchRole,
} from "@/lib/api/queries/use-church-role-mutations";
export { useChurchMemberships, useAssignableRoles, usePasswordResetRequests, usePendingAccessUsers } from "@/lib/api/queries/use-church-memberships";
export { useResetMemberPassword } from "@/lib/api/queries/use-reset-member-password";
export { useUpdateChurchMembership } from "@/lib/api/queries/use-membership-mutations";
export { useMinistries, useMinistry, useMinistryEvents, useMinistryMembers } from "@/lib/api/queries/use-ministries";
export {
  useAssignMemberToMinistry,
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
  useUpdateMinistry,
  useUpdateMinistryRole,
} from "@/lib/api/queries/use-ministry-mutations";
export { usePricing } from "@/lib/api/queries/use-pricing";
