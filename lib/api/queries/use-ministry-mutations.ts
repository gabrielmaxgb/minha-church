"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  createMinistry,
  createMinistryEvent,
  createMinistryRole,
  deleteMinistry,
  deleteMinistryRole,
  ministriesKeys,
  type CreateMinistryPayload,
  type CreateMinistryRolePayload,
  type UpdateMinistryPayload,
  type UpdateMinistryRolePayload,
  updateMinistry,
  updateMinistryRole,
} from "@/lib/api/queries/ministries.keys";
import { queries } from "@/lib/api/queries";
import { ministryDetailPath } from "@/constants/routes";
import type { CreateMinistryEventPayload } from "@/types/ministries";
import { useTenant } from "@/providers/auth-provider";

function useInvalidateMinistries() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: ministriesKeys._def });
    await queryClient.invalidateQueries({ queryKey: queries.members._def });
    await queryClient.invalidateQueries({ queryKey: queries.events._def });
    await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
  };
}

export function useCreateMinistry() {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMinistries();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateMinistryPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createMinistry(churchId, payload);
    },
    onSuccess: async (ministry) => {
      await invalidate();
      router.push(ministryDetailPath(ministry.id));
    },
  });
}

export function useUpdateMinistry(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMinistries();

  return useMutation({
    mutationFn: (payload: UpdateMinistryPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateMinistry(churchId, ministryId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteMinistry(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMinistries();
  const router = useRouter();

  return useMutation({
    mutationFn: () => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return deleteMinistry(churchId, ministryId);
    },
    onSuccess: async () => {
      await invalidate();
      router.push("/app/ministerios");
    },
  });
}

export function useCreateMinistryRole(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMinistries();

  return useMutation({
    mutationFn: (payload: CreateMinistryRolePayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createMinistryRole(churchId, ministryId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateMinistryRole(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMinistries();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateMinistryRolePayload;
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateMinistryRole(churchId, ministryId, roleId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteMinistryRole(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMinistries();

  return useMutation({
    mutationFn: (roleId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return deleteMinistryRole(churchId, ministryId, roleId);
    },
    onSuccess: invalidate,
  });
}

export function useCreateMinistryEvent(ministryId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateMinistries();

  return useMutation({
    mutationFn: (payload: CreateMinistryEventPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createMinistryEvent(churchId, ministryId, payload);
    },
    onSuccess: invalidate,
  });
}
