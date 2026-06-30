"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createChurchEvent,
  eventsKeys,
  type CreateChurchEventPayload,
} from "@/lib/api/queries/events.keys";
import { ministriesKeys, queries } from "@/lib/api/queries";
import { useTenant } from "@/providers/auth-provider";

function useInvalidateEvents() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: eventsKeys._def });
    await queryClient.invalidateQueries({ queryKey: ministriesKeys._def });
    await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
  };
}

export function useCreateChurchEvent() {
  const { churchId } = useTenant();
  const invalidate = useInvalidateEvents();

  return useMutation({
    mutationFn: (payload: CreateChurchEventPayload) => {
      if (!churchId) {
        throw new Error("Igreja não selecionada.");
      }

      return createChurchEvent(churchId, payload);
    },
    onSuccess: invalidate,
  });
}
