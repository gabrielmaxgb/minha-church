"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  announcementsKeys,
  createAnnouncement,
  deleteAnnouncement,
  markAnnouncementRead,
  updateAnnouncement,
} from "@/lib/api/queries/announcements.keys";
import { useTenant } from "@/providers/auth-provider";
import type {
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from "@/types/announcements";

function useInvalidateAnnouncements() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: announcementsKeys._def });
  };
}

export function useCreateAnnouncement() {
  const { churchId } = useTenant();
  const invalidate = useInvalidateAnnouncements();

  return useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createAnnouncement(churchId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateAnnouncement(announcementId: string) {
  const { churchId } = useTenant();
  const invalidate = useInvalidateAnnouncements();

  return useMutation({
    mutationFn: (payload: UpdateAnnouncementPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateAnnouncement(churchId, announcementId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteAnnouncement() {
  const { churchId } = useTenant();
  const invalidate = useInvalidateAnnouncements();

  return useMutation({
    mutationFn: (announcementId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return deleteAnnouncement(churchId, announcementId);
    },
    onSuccess: invalidate,
  });
}

export function useMarkAnnouncementRead() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return markAnnouncementRead(churchId, announcementId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: announcementsKeys._def });
    },
  });
}
