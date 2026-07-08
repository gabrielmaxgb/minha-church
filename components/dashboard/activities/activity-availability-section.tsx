"use client";

import { useState } from "react";

import { EventAvailabilityPanel } from "@/components/dashboard/my-schedule/event-availability-panel";
import {
  useUpdateChurchEventAvailability,
  useUpdateEventAvailability,
} from "@/lib/api/queries";
import type { ChurchEventDetail } from "@/types/events";

interface ActivityAvailabilitySectionProps {
  event: ChurchEventDetail;
}

export function ActivityAvailabilitySection({
  event,
}: ActivityAvailabilitySectionProps) {
  const updateChurchAvailability = useUpdateChurchEventAvailability(event.id);
  const updateMinistryAvailability = useUpdateEventAvailability(
    event.ministryId ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const busy =
    updateChurchAvailability.isPending || updateMinistryAvailability.isPending;

  async function handleRespond(payload: {
    status: "available" | "unavailable" | "clear";
    roleLabels: string[];
  }) {
    setError(null);

    try {
      if (event.isChurchWide) {
        await updateChurchAvailability.mutateAsync(payload);
        return;
      }

      if (!event.ministryId) {
        return;
      }

      await updateMinistryAvailability.mutateAsync({
        eventId: event.id,
        status: payload.status,
      });
    } catch (respondError) {
      setError(
        respondError instanceof Error
          ? respondError.message
          : "Não foi possível salvar sua disponibilidade.",
      );
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <EventAvailabilityPanel
        showHeader
        availabilityStatus={event.myAvailabilityStatus ?? null}
        availabilityMessage={event.availabilityMessage}
        needsRosterFunctions={
          !event.isChurchWide && (event.needsRosterFunctions ?? false)
        }
        ministryName={event.ministryName ?? "este ministério"}
        busy={busy}
        onRespond={(payload) => void handleRespond(payload)}
      />
    </div>
  );
}
