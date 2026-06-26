import { createQueryKeys } from "@lukemorales/query-key-factory";

import { fetchPricing } from "@/constants/pricing";

export const pricingKeys = createQueryKeys("pricing", {
  current: {
    queryKey: null,
    queryFn: fetchPricing,
  },
});
