"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, ClipboardList, Loader2 } from "lucide-react";

import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
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
  readOnly?: boolean;
}

export function ActivityRosterSection({
  event,
  readOnly = false,
}: ActivityRosterSectionProps) {
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
      {readOnly && (
        <LockedFeatureHint action="gerenciar escalas e coletas de disponibilidade" />
      )}

      {event.isChurchWide && !readOnly ? (
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

      {event.isChurchWide && readOnly && (event.rosterSlots?.length ?? 0) > 0 ? (
        <EventFormSection
          title="Funções desta atividade"
          description="Consulta das funções configuradas para esta atividade."
          icon={ClipboardList}
        >
          <ul className="space-y-1 text-sm text-muted-foreground">
            {(event.rosterSlots ?? []).map((slot) => (
              <li key={slot.id}>{slot.label}</li>
            ))}
          </ul>
        </EventFormSection>
      ) : null}

      <EventFormSection
        title="Montar equipe"
        description={
          readOnly
            ? "Visualização da escala montada para esta atividade."
            : event.isChurchWide
              ? "Quem marcou disponibilidade aparece abaixo. Escolha a função (ou Voluntário) e adicione à escala."
              : "Quem marcou disponibilidade aparece abaixo. Escolha a função e adicione à escala oficial."
        }
        icon={ClipboardList}
        action={
          readOnly ? undefined : event.rosterOpen ? (
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

        {!readOnly && !event.rosterOpen ? (
          <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            A coleta está fechada. Ninguém receberá notificação para marcar sua
            disponibilidade até você abrir a coleta com o botão «Coleta de disponibilidade» acima.
          </p>
        ) : null}

        {!readOnly ? (
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
        ) : event.availabilityMessage ? (
          <div className="mb-6 rounded-xl border border-border/70 bg-muted/10 px-4 py-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mensagem para a equipe
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
              {event.availabilityMessage}
            </p>
          </div>
        ) : null}

        <EventRosterAssignments
          event={event}
          canManage={!readOnly}
          embedded
        />
      </EventFormSection>

      {!readOnly ? (
        <RosterCollectionModal
          event={event}
          open={collectionOpen}
          onClose={() => setCollectionOpen(false)}
        />
      ) : null}
    </div>
  );
}
