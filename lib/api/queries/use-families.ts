"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFamily,
  membersKeys,
} from "@/lib/api/queries/members.keys";
import { useTenant } from "@/providers/auth-provider";

export function useFamilies(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...membersKeys.families(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
  });
}

export function useCreateFamily() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createFamily(churchId, name);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: membersKeys._def,
      });
    },
  });
}
