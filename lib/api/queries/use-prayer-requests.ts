"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  archivePrayerRequest,
  createPrayerRequest,
  deletePrayerRequest,
  prayerRequestsKeys,
  togglePrayerRequestPray,
} from "@/lib/api/queries/prayer-requests.keys";
import { useTenant } from "@/providers/auth-provider";
import type {
  CreatePrayerRequestPayload,
  PrayerRequestBoardStatus,
} from "@/types/prayer-requests";

export function usePrayerRequests(
  status: PrayerRequestBoardStatus = "active",
  options?: { enabled?: boolean },
) {
  const { churchId } = useTenant();

  return useQuery({
    ...prayerRequestsKeys.list(churchId ?? "unknown", status),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    retry: false,
  });
}

function invalidateBoard(queryClient: ReturnType<typeof useQueryClient>, churchId: string | null) {
  return queryClient.invalidateQueries({
    queryKey: prayerRequestsKeys._def,
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
      await invalidateBoard(queryClient, churchId);
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
      await invalidateBoard(queryClient, churchId);
    },
  });
}

export function useArchivePrayerRequest() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return archivePrayerRequest(churchId, requestId);
    },
    onSuccess: async () => {
      await invalidateBoard(queryClient, churchId);
    },
  });
}

export function useTogglePrayerRequestPray(
  status: PrayerRequestBoardStatus = "active",
) {
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
        prayerRequestsKeys.list(churchId ?? "unknown", status).queryKey,
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
