import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  fetchBillingInvoices,
  fetchSubscriptionSummary,
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
});
