"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ministriesKeys,
  updateEventAvailability,
} from "@/lib/api/queries/ministries.keys";
import { updateChurchEventAvailability } from "@/lib/api/queries/events.keys";
import { rosterKeys } from "@/lib/api/queries/roster.keys";
import { CHURCH_WIDE_SCHEDULE_ID } from "@/lib/events/church-wide-schedule";
import { useTenant } from "@/providers/auth-provider";

export function useRespondToRosterAvailability() {
  const { churchId } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ministryId,
      eventId,
      status,
      roleLabels,
    }: {
      ministryId: string;
      eventId: string;
      status: "available" | "unavailable" | "clear";
      roleLabels?: string[];
    }) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      if (ministryId === CHURCH_WIDE_SCHEDULE_ID) {
        await updateChurchEventAvailability(churchId, eventId, {
          status,
          roleLabels,
        });
        return null;
      }

      return updateEventAvailability(churchId, ministryId, eventId, {
        status,
        roleLabels,
      });
    },
    onSuccess: async (profile, variables) => {
      if (
        churchId &&
        profile &&
        variables.ministryId !== CHURCH_WIDE_SCHEDULE_ID
      ) {
        queryClient.setQueryData(
          ministriesKeys.rosterProfile(
            churchId,
            variables.ministryId,
          ).queryKey,
          profile,
        );
      }

      await queryClient.invalidateQueries({ queryKey: rosterKeys._def });
    },
  });
}

/** @deprecated Use useRespondToRosterAvailability */
export const useRespondToWorshipAvailability = useRespondToRosterAvailability;
