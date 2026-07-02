"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assignMemberMinistry,
  membersKeys,
  type AssignMemberMinistryPayload,
  removeMemberMinistry,
} from "@/lib/api/queries/members.keys";
import { ministriesKeys, queries } from "@/lib/api/queries";
import { useTenant } from "@/providers/auth-provider";

function useInvalidateMemberMinistries() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: membersKeys._def });
    await queryClient.invalidateQueries({ queryKey: ministriesKeys._def });
    await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
  };
}

export function useAssignMemberToMinistry(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMemberMinistries();

  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: string;
      payload: Omit<AssignMemberMinistryPayload, "ministryId">;
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return assignMemberMinistry(churchId, memberId, {
        ministryId,
        ...payload,
      });
    },
    onSuccess: invalidate,
  });
}

export function useRemoveMemberFromMinistry(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMemberMinistries();

  return useMutation({
    mutationFn: (memberId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return removeMemberMinistry(churchId, memberId, ministryId);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateMemberMinistryRole(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMemberMinistries();

  return useMutation({
    mutationFn: ({
      memberId,
      ministryRoleId,
    }: {
      memberId: string;
      ministryRoleId: string | null;
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return assignMemberMinistry(churchId, memberId, {
        ministryId,
        ministryRoleId: ministryRoleId ?? undefined,
      });
    },
    onSuccess: invalidate,
  });
}

export function useMemberMinistryAssignment(memberId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMemberMinistries();

  return useMutation({
    mutationFn: (payload: AssignMemberMinistryPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return assignMemberMinistry(churchId, memberId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useMemberMinistryRemoval(memberId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMemberMinistries();

  return useMutation({
    mutationFn: (ministryId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return removeMemberMinistry(churchId, memberId, ministryId);
    },
    onSuccess: invalidate,
  });
}
