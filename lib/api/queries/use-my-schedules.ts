"use client";

import { useQuery } from "@tanstack/react-query";

import { rosterKeys } from "@/lib/api/queries/roster.keys";
import { useTenant } from "@/providers/auth-provider";

export function useMySchedules(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...rosterKeys.mySchedules(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    staleTime: 30_000,
  });
}

/** @deprecated Use useMySchedules */
export const useMyWorshipSchedule = useMySchedules;
