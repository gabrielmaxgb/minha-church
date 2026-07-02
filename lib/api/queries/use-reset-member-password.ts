"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { membershipsKeys, resetMemberPassword } from "@/lib/api/queries/memberships.keys";
import { useTenant } from "@/providers/auth-provider";

export function useResetMemberPassword() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return resetMemberPassword(churchId, userId);
    },
    onSuccess: async () => {
      if (!churchId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: membershipsKeys.passwordResetRequests(churchId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: membershipsKeys.pendingAccess(churchId).queryKey,
        }),
      ]);
    },
  });
}
