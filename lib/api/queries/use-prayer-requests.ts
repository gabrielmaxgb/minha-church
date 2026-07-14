"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPrayerRequest,
  deletePrayerRequest,
  prayerRequestsKeys,
  togglePrayerRequestPray,
} from "@/lib/api/queries/prayer-requests.keys";
import { useTenant } from "@/providers/auth-provider";
import type { CreatePrayerRequestPayload } from "@/types/prayer-requests";

export function usePrayerRequests(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...prayerRequestsKeys.list(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    retry: false,
  });
}

export function useCreatePrayerRequest() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePrayerRequestPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createPrayerRequest(churchId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: prayerRequestsKeys.list(churchId ?? "unknown").queryKey,
      });
    },
  });
}

export function useDeletePrayerRequest() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return deletePrayerRequest(churchId, requestId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: prayerRequestsKeys.list(churchId ?? "unknown").queryKey,
      });
    },
  });
}

export function useTogglePrayerRequestPray() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return togglePrayerRequestPray(churchId, requestId);
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(
        prayerRequestsKeys.list(churchId ?? "unknown").queryKey,
        (current: unknown) => {
          if (!Array.isArray(current)) {
            return current;
          }

          return current.map((item) =>
            item &&
            typeof item === "object" &&
            "id" in item &&
            item.id === updated.id
              ? updated
              : item,
          );
        },
      );
    },
  });
}
