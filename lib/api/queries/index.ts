import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { plansKeys } from "@/lib/api/queries/plans.keys";

export const queries = mergeQueryKeys(plansKeys);

export { plansKeys } from "@/lib/api/queries/plans.keys";
export { usePlans } from "@/lib/api/queries/use-plans";
