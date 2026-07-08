"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, ClipboardList, Loader2 } from "lucide-react";

import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventRosterAssignments } from "@/components/dashboard/activities/event-roster-assignments";
import { EventRosterSlotsEditor } from "@/components/dashboard/activities/event-roster-slots-editor";
import { RosterCollectionModal } from "@/components/dashboard/activities/roster-collection-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSetEventRosterCollection, useUpdateChurchEvent } from "@/lib/api/queries";
import {
  rosterSlotPlanEqual,
  rosterSlotsToPlan,
  type RosterSlotPlanItem,
} from "@/lib/ministries/roster";
import type { ChurchEventDetail } from "@/types/events";

interface ActivityRosterSectionProps {
  event: ChurchEventDetail;
}

export function ActivityRosterSection({ event }: ActivityRosterSectionProps) {
  const updateEvent = useUpdateChurchEvent(event.id);
  const setCollection = useSetEventRosterCollection(event.id);
  const [rosterSlotPlan, setRosterSlotPlan] = useState<RosterSlotPlanItem[]>([]);
  const [slotPlanError, setSlotPlanError] = useState<string | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  const collectionBusy = setCollection.isPending;

  useEffect(() => {
    setRosterSlotPlan(rosterSlotsToPlan(event.rosterSlots ?? []));
    setSlotPlanError(null);
  }, [event.id, event.rosterSlots]);

  async function handleMessageBlur(message: string) {
    const trimmed = message.trim();
    if (trimmed === (event.availabilityMessage ?? "")) {
      return;
    }

    await updateEvent.mutateAsync({
      availabilityMessage: trimmed || null,
    });
  }

  async function handleSlotPlanChange(nextPlan: RosterSlotPlanItem[]) {
    const currentPlan = rosterSlotsToPlan(event.rosterSlots ?? []);

    setRosterSlotPlan(nextPlan);
    setSlotPlanError(null);

    if (rosterSlotPlanEqual(nextPlan, currentPlan)) {
      return;
    }

    try {
      await updateEvent.mutateAsync({
        rosterSlotPlan: nextPlan,
      });
    } catch (saveError) {
      setSlotPlanError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar as funções.",
      );
      setRosterSlotPlan(currentPlan);
    }
  }

  async function handleCloseCollection() {
    setCollectionError(null);

    try {
      await setCollection.mutateAsync({
        rosterOpen: false,
        eventIds: [event.id],
      });
    } catch (closeError) {
      setCollectionError(
        closeError instanceof Error
          ? closeError.message
          : "Não foi possível fechar a coleta.",
      );
    }
  }

  return (
    <div className="space-y-8">
      {event.isChurchWide ? (
        <EventFormSection
          title="Funções desta atividade"
          description="Adicione as funções que essa atividade precisa, como recepção, mídia ou louvor."
          icon={ClipboardList}
        >
          {slotPlanError ? (
            <p className="mb-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {slotPlanError}
            </p>
          ) : null}
          <EventRosterSlotsEditor
            value={rosterSlotPlan}
            onChange={(nextPlan) => void handleSlotPlanChange(nextPlan)}
            disabled={updateEvent.isPending}
            embedded
            optional
          />
        </EventFormSection>
      ) : null}

      <EventFormSection
        title="Montar equipe"
        description={
          event.isChurchWide
            ? "Quem marcou disponibilidade aparece abaixo. Escolha a função (ou Voluntário) e adicione à escala."
            : "Quem marcou disponibilidade aparece abaixo. Escolha a função e adicione à escala oficial."
        }
        icon={ClipboardList}
        action={
          event.rosterOpen ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={collectionBusy}
              onClick={() => void handleCloseCollection()}
            >
              {collectionBusy ? <Loader2 className="size-4 animate-spin" /> : null}
              Fechar coleta de disponibilidade
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={collectionBusy}
              onClick={() => setCollectionOpen(true)}
            >
              <CalendarCheck className="size-4" />
              Coleta de disponibilidade
            </Button>
          )
        }
      >
        {collectionError ? (
          <p className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {collectionError}
          </p>
        ) : null}

        {!event.rosterOpen ? (
          <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            A coleta está fechada. Ninguém recebe notificação para marcar
            disponibilidade até você abrir a coleta com o botão "Coleta de disponibilidade" acima.
          </p>
        ) : null}

        <div className="mb-6 space-y-2">
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

        <EventRosterAssignments event={event} canManage embedded />
      </EventFormSection>

      <RosterCollectionModal
        event={event}
        open={collectionOpen}
        onClose={() => setCollectionOpen(false)}
      />
    </div>
  );
}
