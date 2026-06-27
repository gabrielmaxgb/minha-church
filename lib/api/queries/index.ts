import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
import { pricingKeys } from "@/lib/api/queries/pricing.keys";

export const queries = mergeQueryKeys(pricingKeys, dashboardKeys);

export { dashboardKeys } from "@/lib/api/queries/dashboard.keys";
export { pricingKeys } from "@/lib/api/queries/pricing.keys";
export { useDashboardSummary } from "@/lib/api/queries/use-dashboard-summary";
export { usePricing } from "@/lib/api/queries/use-pricing";
