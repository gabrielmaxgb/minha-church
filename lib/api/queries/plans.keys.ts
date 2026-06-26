import { createQueryKeys } from "@lukemorales/query-key-factory";

import { fetchPlans } from "@/constants/plans";

export const plansKeys = createQueryKeys("plans", {
  all: {
    queryKey: null,
    queryFn: fetchPlans,
  },
});
