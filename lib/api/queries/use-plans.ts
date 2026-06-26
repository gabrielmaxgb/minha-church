"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPlans } from "@/constants/plans";
import { queryKeys } from "@/lib/api/queries/keys";

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: fetchPlans,
  });
}
