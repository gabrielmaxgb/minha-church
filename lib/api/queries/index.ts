import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { pricingKeys } from "@/lib/api/queries/pricing.keys";

export const queries = mergeQueryKeys(pricingKeys);

export { pricingKeys } from "@/lib/api/queries/pricing.keys";
export { usePricing } from "@/lib/api/queries/use-pricing";
