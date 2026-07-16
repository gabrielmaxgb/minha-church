"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  markNotificationRead,
  notificationsKeys,
} from "@/lib/api/queries/notifications.keys";
import { useTenant } from "@/providers/auth-provider";

export function useNotificationInbox(options?: {
  enabled?: boolean;
  poll?: boolean;
}) {
  const { churchId } = useTenant();

  return useQuery({
    ...notificationsKeys.inbox(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    staleTime: 30_000,
    refetchInterval: options?.poll ? 60_000 : false,
    retry: false,
  });
}

export function useMarkNotificationRead() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return markNotificationRead(churchId, id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationsKeys.inbox(churchId ?? "unknown").queryKey,
      });
    },
  });
}
