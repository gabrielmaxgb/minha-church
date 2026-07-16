"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  createMemberRelation,
  deleteMemberRelation,
  membersKeys,
  updateMember,
} from "@/lib/api/queries/members.keys";
import type { MemberRelationType } from "@/types/members";
import { useTenant } from "@/providers/auth-provider";

async function invalidateFamilyMembershipQueries(
  queryClient: QueryClient,
  churchId: string,
  options?: {
    familyId?: string | null;
    memberIds?: string[];
  },
) {
  const tasks: Promise<unknown>[] = [
    queryClient.invalidateQueries({ queryKey: membersKeys.list._def }),
    queryClient.invalidateQueries({ queryKey: membersKeys.families._def }),
    queryClient.invalidateQueries({ queryKey: membersKeys.familyGraph._def }),
  ];

  if (options?.familyId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: membersKeys.familyGraph(churchId, options.familyId).queryKey,
      }),
    );
  }

  for (const memberId of options?.memberIds ?? []) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: membersKeys.detail(churchId, memberId).queryKey,
      }),
    );
  }

  await Promise.all(tasks);
}

function resolveMemberIds(payload: {
  memberId?: string;
  memberIds?: string[];
}): string[] {
  if (payload.memberIds && payload.memberIds.length > 0) {
    return [...new Set(payload.memberIds)];
  }
  if (payload.memberId) {
    return [payload.memberId];
  }
  return [];
}

export function useFamilyGraph(familyId: string, options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...membersKeys.familyGraph(churchId ?? "unknown", familyId),
    enabled: Boolean(churchId && familyId) && (options?.enabled ?? true),
  });
}

export function useSetMemberFamily(familyId?: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      memberId?: string;
      memberIds?: string[];
      familyId: string | null;
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      const memberIds = resolveMemberIds(payload);
      if (memberIds.length === 0) {
        throw new Error("Selecione ao menos uma pessoa.");
      }

      const results = await Promise.allSettled(
        memberIds.map((memberId) =>
          updateMember(churchId, memberId, { familyId: payload.familyId }),
        ),
      );

      const succeededIds: string[] = [];
      const failures: string[] = [];

      results.forEach((result, index) => {
        const memberId = memberIds[index]!;
        if (result.status === "fulfilled") {
          succeededIds.push(memberId);
          return;
        }

        const reason = result.reason;
        failures.push(
          reason instanceof Error
            ? reason.message
            : "Não foi possível atualizar o vínculo familiar.",
        );
      });

      if (succeededIds.length === 0) {
        throw new Error(failures[0] ?? "Não foi possível atualizar o vínculo familiar.");
      }

      return {
        succeededIds,
        failedCount: failures.length,
        firstError: failures[0] ?? null,
      };
    },
    onSuccess: async (result, variables) => {
      if (!churchId) {
        return;
      }

      await invalidateFamilyMembershipQueries(queryClient, churchId, {
        familyId: variables.familyId ?? familyId ?? null,
        memberIds: result.succeededIds,
      });
    },
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
