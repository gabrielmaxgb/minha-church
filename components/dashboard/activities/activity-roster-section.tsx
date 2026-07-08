"use client";

import { ClipboardList } from "lucide-react";

import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventRosterAssignments } from "@/components/dashboard/activities/event-roster-assignments";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateChurchEvent } from "@/lib/api/queries";
import type { ChurchEventDetail } from "@/types/events";

interface ActivityRosterSectionProps {
  event: ChurchEventDetail;
}

export function ActivityRosterSection({ event }: ActivityRosterSectionProps) {
  const updateEvent = useUpdateChurchEvent(event.id);

  async function handleMessageBlur(message: string) {
    const trimmed = message.trim();
    if (trimmed === (event.availabilityMessage ?? "")) {
      return;
    }

    await updateEvent.mutateAsync({
      availabilityMessage: trimmed || null,
    });
  }

  return (
    <div className="space-y-8">
      <EventFormSection
        title="Escala"
        description="Mensagem opcional para a equipe e montagem da escala oficial."
        icon={ClipboardList}
      >
        <div className="space-y-2">
          <Label htmlFor="event-availability-message">
            Mensagem para a equipe (opcional)
          </Label>
          <Textarea
            id="event-availability-message"
            defaultValue={event.availabilityMessage ?? ""}
            rows={2}
            maxLength={1000}
            disabled={updateEvent.isPending}
            className="min-h-[72px] resize-y rounded-xl text-sm"
            placeholder="Ex.: Cheguem 30 min antes para o ensaio."
            onBlur={(blurEvent) => void handleMessageBlur(blurEvent.target.value)}
          />
        </div>
      </EventFormSection>

      <EventFormSection
        title="Montar equipe"
        description="Quem marcou disponibilidade aparece abaixo. Escolha a função e adicione à escala oficial."
        icon={ClipboardList}
      >
        <EventRosterAssignments event={event} canManage embedded />
      </EventFormSection>
    </div>
  );
}
