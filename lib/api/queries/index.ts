import { mergeQueryKeys } from "@lukemorales/query-key-factory";

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
);

export { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
export { eventsKeys } from "@/lib/api/queries/events.keys";
export { membersKeys } from "@/lib/api/queries/members.keys";
export { membershipsKeys } from "@/lib/api/queries/memberships.keys";
export { ministriesKeys } from "@/lib/api/queries/ministries.keys";
export { pricingKeys } from "@/lib/api/queries/pricing.keys";
export { useChurchEvents } from "@/lib/api/queries/use-church-events";
export { useCreateChurchEvent } from "@/lib/api/queries/use-event-mutations";
export { useDashboardSummary } from "@/lib/api/queries/use-dashboard-summary";
export { useMembers, useReceiveMember } from "@/lib/api/queries/use-members";
export {
  useCreateMember,
  useDeleteMember,
  useUpdateMember,
} from "@/lib/api/queries/use-member-mutations";
export { useChurchMemberships } from "@/lib/api/queries/use-church-memberships";
export { useUpdateChurchMembership } from "@/lib/api/queries/use-membership-mutations";
export { useMinistries, useMinistry, useMinistryEvents, useMinistryMembers } from "@/lib/api/queries/use-ministries";
export {
  useAssignMemberToMinistry,
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
