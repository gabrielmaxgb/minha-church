"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ministriesKeys,
  updateEventAvailability,
} from "@/lib/api/queries/ministries.keys";
import { eventsKeys, updateChurchEventAvailability } from "@/lib/api/queries/events.keys";
import { rosterKeys } from "@/lib/api/queries/roster.keys";
import { CHURCH_WIDE_SCHEDULE_ID } from "@/lib/events/church-wide-schedule";
import { useTenant } from "@/providers/auth-provider";

function invalidateAvailabilityViews(
  queryClient: ReturnType<typeof useQueryClient>,
  churchId: string,
  ministryId: string,
  eventId: string,
) {
  // Fire-and-forget: don't hold the button busy while heavy GETs refetch.
  // Skip dashboard — members often get 403 on /summary and it isn't needed here.
  void queryClient.invalidateQueries({
    queryKey: rosterKeys._def,
  });

  if (ministryId !== CHURCH_WIDE_SCHEDULE_ID) {
    void queryClient.invalidateQueries({
      queryKey: ministriesKeys.rosterProfile(churchId, ministryId).queryKey,
    });
  }

  void queryClient.invalidateQueries({
    queryKey: eventsKeys.detail(churchId, eventId).queryKey,
  });
}

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
        return;
      }

      await updateEventAvailability(churchId, ministryId, eventId, {
        status,
        roleLabels,
      });
    },
    onSuccess: (_data, variables) => {
      if (!churchId) return;
      invalidateAvailabilityViews(
        queryClient,
        churchId,
        variables.ministryId,
        variables.eventId,
      );
    },
  });
}

/** @deprecated Use useRespondToRosterAvailability */
export const useRespondToWorshipAvailability = useRespondToRosterAvailability;
