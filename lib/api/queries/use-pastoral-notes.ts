"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import {
  createPastoralNote,
  deletePastoralNote,
  pastoralNotesKeys,
  updatePastoralNote,
} from "@/lib/api/queries/pastoral-notes.keys";
import { useAuth, useTenant } from "@/providers/auth-provider";
import type {
  CreatePastoralNotePayload,
  UpdatePastoralNotePayload,
} from "@/types/pastoral-notes";

function canAccessPastoralCare(
  user: { isOwner?: boolean } | null | undefined,
  permissions: { pastoralCare?: { access?: boolean } } | null,
) {
  return Boolean(user?.isOwner || permissions?.pastoralCare?.access);
}

export function usePastoralCareSummary(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();
  const { user, permissions } = useAuth();
  const allowed = canAccessPastoralCare(user, permissions);

  return useQuery({
    ...pastoralNotesKeys.summary(churchId ?? "unknown"),
    enabled: Boolean(churchId) && allowed && (options?.enabled ?? true),
    staleTime: 20_000,
    retry: false,
  });
}

export function useMemberPastoralNotes(
  memberId: string,
  params?: { page?: number; limit?: number },
  options?: { enabled?: boolean },
) {
  const { churchId } = useTenant();
  const { user, permissions } = useAuth();
  const allowed = canAccessPastoralCare(user, permissions);

  return useQuery({
    ...pastoralNotesKeys.memberNotes(
      churchId ?? "unknown",
      memberId,
      params ?? {},
    ),
    enabled:
      Boolean(churchId && memberId) &&
      allowed &&
      (options?.enabled ?? true),
    staleTime: 15_000,
    retry: false,
  });
}

export function useCreatePastoralNote() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePastoralNotePayload) => {
      if (!churchId) throw new Error("Igreja não selecionada.");
      return createPastoralNote(churchId, payload);
    },
    onSuccess: (_data, variables) => {
      if (!churchId) return;
      void queryClient.invalidateQueries({
        queryKey: pastoralNotesKeys._def,
      });
      void queryClient.invalidateQueries({
        queryKey: pastoralNotesKeys.memberNotes(churchId, variables.memberId)
          .queryKey,
      });
    },
  });
}

export function useUpdatePastoralNote() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      payload,
    }: {
      noteId: string;
      payload: UpdatePastoralNotePayload;
    }) => {
      if (!churchId) throw new Error("Igreja não selecionada.");
      return updatePastoralNote(churchId, noteId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: pastoralNotesKeys._def,
      });
    },
  });
}

export function useDeletePastoralNote() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => {
      if (!churchId) throw new Error("Igreja não selecionada.");
      return deletePastoralNote(churchId, noteId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: pastoralNotesKeys._def,
      });
    },
  });
}

export function resolvePastoralNotesError(
  error: unknown,
  fallback = "Não foi possível concluir a ação. Tente novamente.",
): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
