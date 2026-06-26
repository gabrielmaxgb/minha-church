"use client";

import { useQuery } from "@tanstack/react-query";

import { queries } from "@/lib/api/queries";

export function usePricing() {
  return useQuery(queries.pricing.current);
}
