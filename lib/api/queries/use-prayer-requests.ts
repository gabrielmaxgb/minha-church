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
  PrayerRequest,
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
  const listKey = prayerRequestsKeys.list(
    churchId ?? "unknown",
    status,
  ).queryKey;

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return togglePrayerRequestPray(churchId, requestId);
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: listKey });

      const previousList = queryClient.getQueryData<PrayerRequest[]>(listKey);
      const previousItem = previousList?.find((item) => item.id === requestId);

      queryClient.setQueryData<PrayerRequest[]>(listKey, (current) => {
        if (!Array.isArray(current)) {
          return current;
        }

        return current.map((item) => {
          if (item.id !== requestId) {
            return item;
          }

          const prayedByMe = !item.prayedByMe;

          return {
            ...item,
            prayedByMe,
            prayerCount: Math.max(
              0,
              item.prayerCount + (prayedByMe ? 1 : -1),
            ),
          };
        });
      });

      return { previousItem };
    },
    onError: (_error, requestId, context) => {
      if (!context?.previousItem) {
        return;
      }

      queryClient.setQueryData<PrayerRequest[]>(listKey, (current) => {
        if (!Array.isArray(current)) {
          return current;
        }

        return current.map((item) =>
          item.id === requestId ? context.previousItem! : item,
        );
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<PrayerRequest[]>(listKey, (current) => {
        if (!Array.isArray(current)) {
          return current;
        }

        return current.map((item) =>
          item.id === updated.id ? updated : item,
        );
      });
    },
  });
}
