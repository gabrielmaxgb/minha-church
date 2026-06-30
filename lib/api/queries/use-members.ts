"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  membersKeys,
  receiveMember,
} from "@/lib/api/queries/members.keys";
import { queries } from "@/lib/api/queries";
import type { ListMembersParams } from "@/types/members";
import { useTenant } from "@/providers/auth-provider";

export function useMembers(params: ListMembersParams = {}) {
  const { churchId } = useTenant();

  return useQuery({
    ...membersKeys.list(churchId ?? "unknown", params),
    enabled: Boolean(churchId),
  });
}

export function useReceiveMember() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return receiveMember(churchId, memberId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: membersKeys._def });
      await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
    },
  });
}
