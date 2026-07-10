import { createQueryKeys } from "@lukemorales/query-key-factory";

import { fetchSubscriptionSummary } from "@/lib/api/billing";

export const billingKeys = createQueryKeys("billing", {
  subscription: (churchId: string) => ({
    queryKey: [churchId],
    queryFn: () => fetchSubscriptionSummary(churchId),
  }),
});
