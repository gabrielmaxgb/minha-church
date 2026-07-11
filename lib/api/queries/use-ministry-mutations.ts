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
  setRosterCollection,
  type CreateMinistryPayload,
  type CreateMinistryRolePayload,
  type UpdateMinistryPayload,
  type UpdateMinistryRolePayload,
  updateEventAvailability,
  updateEventRoleProfile,
  updateMinistry,
  updateMinistryRole,
  updateRosterProfile,
  replaceMinistryServiceFunctions,
  updateMemberMinistryInstruments,
} from "@/lib/api/queries/ministries.keys";
import { eventsKeys } from "@/lib/api/queries/events.keys";
import { membersKeys } from "@/lib/api/queries/members.keys";
import { rosterKeys } from "@/lib/api/queries/roster.keys";
import { queries } from "@/lib/api/queries";
import { ministryDetailPath } from "@/constants/routes";
import type { CreateMinistryEventPayload } from "@/types/ministries";
import { useTenant } from "@/providers/auth-provider";

function useInvalidateMinistries() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: ministriesKeys._def });
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

export function useUpdateRosterProfile(ministryId: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instruments: string[]) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateRosterProfile(churchId, ministryId, instruments);
    },
    onSuccess: async (profile) => {
      queryClient.setQueryData(
        ministriesKeys.rosterProfile(churchId ?? "unknown", ministryId).queryKey,
        profile,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ministriesKeys.members(churchId ?? "unknown", ministryId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: rosterKeys.mySchedules(churchId ?? "unknown").queryKey,
        }),
      ]);
    },
  });
}

/** @deprecated Use useUpdateRosterProfile */
export const useUpdateWorshipProfile = useUpdateRosterProfile;

export function useUpdateEventRoleProfile(ministryId: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileKey,
      roleLabels,
    }: {
      profileKey: string;
      roleLabels: string[];
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateEventRoleProfile(
        churchId,
        ministryId,
        profileKey,
        roleLabels,
      );
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(
        ministriesKeys.rosterProfile(churchId ?? "unknown", ministryId).queryKey,
        profile,
      );
      void queryClient.invalidateQueries({ queryKey: rosterKeys._def });
    },
  });
}

export function useUpdateEventAvailability(ministryId: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      status,
      roleLabels,
    }: {
      eventId: string;
      status: "available" | "unavailable" | "clear";
      roleLabels?: string[];
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateEventAvailability(churchId, ministryId, eventId, {
        status,
        roleLabels,
      });
    },
    onSuccess: async (profile, variables) => {
      if (churchId) {
        queryClient.setQueryData(
          ministriesKeys.rosterProfile(churchId, ministryId).queryKey,
          profile,
        );
        await queryClient.invalidateQueries({
          queryKey: ministriesKeys.rosterProfile(churchId, ministryId).queryKey,
        });
        await queryClient.invalidateQueries({
          queryKey: eventsKeys.detail(churchId, variables.eventId).queryKey,
        });
        await queryClient.invalidateQueries({ queryKey: eventsKeys._def });
        await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
      }

      await queryClient.invalidateQueries({ queryKey: rosterKeys._def });
    },
  });
}

export function useSetRosterCollection(ministryId: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      rosterOpen: boolean;
      eventIds?: string[];
      recurrenceSeriesId?: string;
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return setRosterCollection(churchId, ministryId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ministriesKeys._def });
      await queryClient.invalidateQueries({ queryKey: rosterKeys._def });
    },
  });
}

export function useReplaceMinistryServiceFunctions(ministryId: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMinistries();

  return useMutation({
    mutationFn: (labels: string[]) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return replaceMinistryServiceFunctions(churchId, ministryId, labels);
    },
    onSuccess: async () => {
      await invalidate();
      if (churchId) {
        await queryClient.invalidateQueries({
          queryKey: ministriesKeys.detail(churchId, ministryId).queryKey,
        });
      }
    },
  });
}

export function useUpdateMemberMinistryInstruments(ministryId: string) {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      instruments,
    }: {
      memberId: string;
      instruments: string[];
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return updateMemberMinistryInstruments(
        churchId,
        ministryId,
        memberId,
        instruments,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ministriesKeys._def });
      await queryClient.invalidateQueries({ queryKey: membersKeys._def });
    },
  });
}
