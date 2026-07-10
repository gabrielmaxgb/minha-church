"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMemberRelation,
  deleteMemberRelation,
  membersKeys,
} from "@/lib/api/queries/members.keys";
import type { MemberRelationType } from "@/types/members";
import { useTenant } from "@/providers/auth-provider";

export function useFamilyGraph(familyId: string, options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...membersKeys.familyGraph(churchId ?? "unknown", familyId),
    enabled: Boolean(churchId && familyId) && (options?.enabled ?? true),
  });
}

export function useCreateMemberRelation(familyId: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      fromMemberId: string;
      toMemberId: string;
      type: MemberRelationType;
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createMemberRelation(churchId, familyId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: membersKeys.familyGraph(churchId ?? "unknown", familyId).queryKey,
      });
    },
  });
}

export function useDeleteMemberRelation(familyId: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return deleteMemberRelation(churchId, familyId, relationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: membersKeys.familyGraph(churchId ?? "unknown", familyId).queryKey,
      });
    },
  });
}
