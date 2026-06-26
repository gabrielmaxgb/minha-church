"use client";

import { useQuery } from "@tanstack/react-query";

import { queries } from "@/lib/api/queries";

export function usePlans() {
  return useQuery(queries.plans.all);
}
