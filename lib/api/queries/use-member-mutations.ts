"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createMember,
  deleteMember,
  membersKeys,
  type CreateMemberPayload,
  type UpdateMemberPayload,
  updateMember,
} from "@/lib/api/queries/members.keys";
import { membershipsKeys, queries } from "@/lib/api/queries";
import { billingKeys } from "@/lib/api/queries/billing.keys";
import { useAuth, useTenant } from "@/providers/auth-provider";

function useInvalidateMembers() {
  const queryClient = useQueryClient();
  const { reloadSession } = useAuth();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: membersKeys._def });
    await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
    await reloadSession();
  };
}

export function useCreateMember() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMembers();

  return useMutation({
    mutationFn: (payload: CreateMemberPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createMember(churchId, payload);
    },
    onSuccess: async () => {
      await invalidate();
      await queryClient.invalidateQueries({ queryKey: membershipsKeys._def });
      await queryClient.invalidateQueries({ queryKey: billingKeys._def });
    },
  });
}

export function useUpdateMember(memberId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMembers();

  return useMutation({
    mutationFn: (payload: UpdateMemberPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateMember(churchId, memberId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteMember(memberId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMembers();

  return useMutation({
    mutationFn: () => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return deleteMember(churchId, memberId);
    },
    onSuccess: invalidate,
  });
}
