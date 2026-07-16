"use client";

import { useState } from "react";

import { EventAvailabilityPanel } from "@/components/dashboard/my-schedule/event-availability-panel";
import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import {
  useUpdateChurchEventAvailability,
  useUpdateEventAvailability,
} from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import type { ChurchEventDetail } from "@/types/events";

interface ActivityAvailabilitySectionProps {
  event: ChurchEventDetail;
  interactionsDisabled?: boolean;
  dense?: boolean;
  flush?: boolean;
  registrationAlsoOpen?: boolean;
}

export function ActivityAvailabilitySection({
  event,
  interactionsDisabled = false,
  dense = false,
  flush = false,
  registrationAlsoOpen = false,
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
    <div className={dense ? "h-full" : "space-y-3"}>
      {interactionsDisabled && !dense ? (
        <LockedFeatureHint action="marcar disponibilidade em escalas" />
      ) : null}

      {error ? (
        <p className="mb-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <EventAvailabilityPanel
        showHeader
        registrationAlsoOpen={registrationAlsoOpen}
        layout={dense ? "compact" : "default"}
        className={cn(
          dense && "h-full",
          flush && "rounded-none border-0 shadow-none ring-0",
        )}
        availabilityStatus={event.myAvailabilityStatus ?? null}
        availabilityMessage={dense ? null : event.availabilityMessage}
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
