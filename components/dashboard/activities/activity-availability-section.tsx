"use client";

import { useState } from "react";

import { EventAvailabilityPanel } from "@/components/dashboard/my-schedule/event-availability-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const rosterRoles = (event.rosterSlots ?? []).map((slot) => slot.label);
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
        roleLabels: payload.roleLabels,
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
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base">
          Sua disponibilidade
        </CardTitle>
        <CardDescription>
          Informe se você pode ajudar e em quais funções deste evento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="mb-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <EventAvailabilityPanel
          rosterRoles={rosterRoles}
          myRoleLabels={event.myRoleLabels ?? []}
          availabilityStatus={event.myAvailabilityStatus ?? null}
          busy={busy}
          onRespond={(payload) => void handleRespond(payload)}
        />
      </CardContent>
    </Card>
  );
}
