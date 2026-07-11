"use client";

import { useState } from "react";

import { EventAvailabilityPanel } from "@/components/dashboard/my-schedule/event-availability-panel";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import {
  useUpdateChurchEventAvailability,
  useUpdateEventAvailability,
} from "@/lib/api/queries";
import type { ChurchEventDetail } from "@/types/events";

interface ActivityAvailabilitySectionProps {
  event: ChurchEventDetail;
  interactionsDisabled?: boolean;
}

export function ActivityAvailabilitySection({
  event,
  interactionsDisabled = false,
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
      {interactionsDisabled ? (
        <LockedFeatureHint action="marcar disponibilidade em escalas" />
      ) : null}

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
        interactionsDisabled={interactionsDisabled}
        onRespond={(payload) => void handleRespond(payload)}
      />
    </div>
  );
}
