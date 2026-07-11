import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  fetchBillingInvoices,
  fetchPendingTierCrossing,
  fetchSubscriptionSummary,
  fetchTierCrossingStaffNotices,
} from "@/lib/api/billing";

export const billingKeys = createQueryKeys("billing", {
  subscription: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchSubscriptionSummary(churchId),
  }),
  invoices: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchBillingInvoices(churchId),
  }),
  tierCrossingPending: (churchId: string) => ({
    queryKey: [churchId, "tier-crossing-pending"],
    queryFn: () => fetchPendingTierCrossing(churchId),
  }),
  tierCrossingNotices: (churchId: string) => ({
    queryKey: [churchId, "tier-crossing-notices"],
    queryFn: () => fetchTierCrossingStaffNotices(churchId),
  }),
});
