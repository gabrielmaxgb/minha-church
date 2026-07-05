"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchMembers,
  membersKeys,
  receiveMember,
} from "@/lib/api/queries/members.keys";
import { queries } from "@/lib/api/queries";
import type { ListMembersParams } from "@/types/members";
import { useTenant } from "@/providers/auth-provider";

export const MEMBERS_PAGE_SIZE = 50;

export function useMembers(params: ListMembersParams = {}) {
  const { churchId } = useTenant();

  return useQuery({
    ...membersKeys.list(churchId ?? "unknown", params),
    enabled: Boolean(churchId),
  });
}

export function useMembersInfinite(
  params: Omit<ListMembersParams, "page" | "limit"> = {},
) {
  const { churchId } = useTenant();

  return useInfiniteQuery({
    queryKey: [
      ...membersKeys.list(churchId ?? "unknown", params).queryKey,
      "infinite",
    ],
    queryFn: ({ pageParam }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return fetchMembers(churchId, {
        ...params,
        page: pageParam,
        limit: MEMBERS_PAGE_SIZE,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.meta;

      if (page * limit >= total) {
        return undefined;
      }

      return page + 1;
    },
    enabled: Boolean(churchId),
  });
}

export function useMember(memberId: string) {
  const { churchId } = useTenant();

  return useQuery({
    ...membersKeys.detail(churchId ?? "unknown", memberId),
    enabled: Boolean(churchId && memberId),
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
