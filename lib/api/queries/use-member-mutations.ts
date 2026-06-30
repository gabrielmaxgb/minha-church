"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  createMember,
  deleteMember,
  membersKeys,
  type CreateMemberPayload,
  type UpdateMemberPayload,
  updateMember,
} from "@/lib/api/queries/members.keys";
import { queries } from "@/lib/api/queries";
import { AUTH_ROUTES } from "@/constants/routes";
import { useTenant } from "@/providers/auth-provider";

function useInvalidateMembers() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: membersKeys._def });
    await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
  };
}

export function useCreateMember() {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMembers();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateMemberPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createMember(churchId, payload);
    },
    onSuccess: async () => {
      await invalidate();
      router.push(AUTH_ROUTES.members);
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
