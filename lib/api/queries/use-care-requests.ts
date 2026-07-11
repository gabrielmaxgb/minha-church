"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  careRequestsKeys,
  createCareRequest,
  markCareRequestViewed,
} from "@/lib/api/queries/care-requests.keys";
import { useTenant } from "@/providers/auth-provider";
import type { CreateCareRequestPayload } from "@/types/care-requests";

export function useCareRecipients(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...careRequestsKeys.recipients(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    retry: false,
  });
}

export function useMyCareRequests(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...careRequestsKeys.mine(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    retry: false,
  });
}

export function useCareInbox(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...careRequestsKeys.inbox(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    retry: false,
  });
}

export function useCareInboxPendingCount(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...careRequestsKeys.pendingCount(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreateCareRequest() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCareRequestPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createCareRequest(churchId, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: careRequestsKeys.mine(churchId ?? "unknown").queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: careRequestsKeys.pendingCount(churchId ?? "unknown")
            .queryKey,
        }),
      ]);
    },
  });
}

export function useMarkCareRequestViewed() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return markCareRequestViewed(churchId, requestId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: careRequestsKeys.inbox(churchId ?? "unknown").queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: careRequestsKeys.pendingCount(churchId ?? "unknown")
            .queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: careRequestsKeys.mine(churchId ?? "unknown").queryKey,
        }),
      ]);
    },
  });
}
