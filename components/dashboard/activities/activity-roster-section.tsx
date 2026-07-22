"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  ClipboardList,
  Loader2,
  MessageSquare,
} from "lucide-react";

import { LockedFeatureHint } from "@/components/dashboard/locked-feature-hint";
import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventRosterAssignments } from "@/components/dashboard/activities/event-roster-assignments";
import { EventRosterSlotsEditor } from "@/components/dashboard/activities/event-roster-slots-editor";
import { RosterCollectionModal } from "@/components/dashboard/activities/roster-collection-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useSetEventRosterCollection,
  useUpdateChurchEvent,
} from "@/lib/api/queries";
import {
  rosterSlotPlanEqual,
  rosterSlotsToPlan,
  type RosterSlotPlanItem,
} from "@/lib/ministries/roster";
import { toastApiError } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";
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
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(
    Boolean(event.availabilityMessage?.trim()),
  );

  const collectionBusy = setCollection.isPending;
  const availableCount = event.rosterCandidates.filter(
    (candidate) => candidate.availabilityStatus === "available",
  ).length;
  const assignedCount = event.roster.length;

  useEffect(() => {
    setRosterSlotPlan(rosterSlotsToPlan(event.rosterSlots ?? []));
  }, [event.id, event.rosterSlots]);

  useEffect(() => {
    if (event.availabilityMessage?.trim()) {
      setMessageOpen(true);
    }
  }, [event.availabilityMessage]);

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

    if (rosterSlotPlanEqual(nextPlan, currentPlan)) {
      return;
    }

    try {
      await updateEvent.mutateAsync({
        rosterSlotPlan: nextPlan,
      });
    } catch (saveError) {
      toastApiError(saveError, "Não foi possível salvar as funções.");
      setRosterSlotPlan(currentPlan);
    }
  }

  async function handleCloseCollection() {
    try {
      await setCollection.mutateAsync({
        rosterOpen: false,
        eventIds: [event.id],
      });
    } catch (closeError) {
      toastApiError(closeError, "Não foi possível fechar a coleta.");
    }
  }

  return (
    <div className="space-y-5">
      {readOnly && (
        <LockedFeatureHint action="gerenciar escalas e coletas de disponibilidade" />
      )}

      {event.isChurchWide && !readOnly ? (
        <EventFormSection
          title="Funções desta atividade"
          description="Opcional — defina as vagas (recepção, mídia, infantil…)."
          icon={ClipboardList}
        >
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
          <ul className="flex flex-wrap gap-2">
            {(event.rosterSlots ?? []).map((slot) => (
              <li
                key={slot.id}
                className="rounded-full border border-border bg-muted/30 px-3 py-1 text-sm"
              >
                {slot.label}
              </li>
            ))}
          </ul>
        </EventFormSection>
      ) : null}

      {!readOnly ? (
        <section
          className={cn(
            "overflow-hidden rounded-2xl border",
            event.rosterOpen
              ? "border-success/35 bg-success-subtle/40"
              : "border-border/80 bg-card",
          )}
        >
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex size-2 rounded-full",
                    event.rosterOpen ? "bg-success" : "bg-muted-foreground/40",
                  )}
                  aria-hidden
                />
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  {event.rosterOpen
                    ? "Coleta de disponibilidade aberta"
                    : "Coleta de disponibilidade fechada"}
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.rosterOpen
                  ? `${availableCount} disponível${availableCount === 1 ? "" : "eis"} · ${assignedCount} na escala`
                  : "Abra a coleta para a equipe marcar se pode servir neste dia."}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {!event.rosterOpen ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={collectionBusy}
                  onClick={() => setCollectionOpen(true)}
                >
                  <CalendarCheck className="size-4" />
                  Abrir coleta
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={collectionBusy}
                  onClick={() => void handleCloseCollection()}
                >
                  {collectionBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Fechar coleta
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setMessageOpen((open) => !open)}
              >
                <MessageSquare className="size-4" />
                Mensagem
              </Button>
            </div>
          </div>

          {messageOpen ? (
            <div className="border-t border-border/60 bg-background/60 px-4 py-4 sm:px-5">
              <label
                htmlFor="event-availability-message"
                className="text-xs font-medium text-muted-foreground"
              >
                Mensagem para a equipe (opcional)
              </label>
              <Textarea
                id="event-availability-message"
                defaultValue={event.availabilityMessage ?? ""}
                key={`${event.id}-${event.availabilityMessage ?? ""}`}
                rows={2}
                maxLength={1000}
                disabled={updateEvent.isPending}
                className="mt-2 min-h-[72px] resize-y rounded-xl text-sm"
                placeholder="Ex.: Cheguem 30 min antes para o ensaio."
                onBlur={(blurEvent) =>
                  void handleMessageBlur(blurEvent.target.value)
                }
              />
            </div>
          ) : event.availabilityMessage ? (
            <div className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground sm:px-5">
              <span className="font-medium text-foreground">Mensagem: </span>
              {event.availabilityMessage}
            </div>
          ) : null}
        </section>
      ) : event.availabilityMessage ? (
        <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Mensagem para a equipe
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {event.availabilityMessage}
          </p>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card">
        <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border/60 px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Montar equipe
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {readOnly
                ? "Escala deste dia."
                : "Monte a escala quando quiser — a coleta de disponibilidade ajuda, mas não é obrigatória."}
            </p>
            {!readOnly ? (
              <p className="mt-1 text-[11px] tabular-nums text-muted-foreground/80">
                {assignedCount} escalado{assignedCount === 1 ? "" : "s"} ·{" "}
                {availableCount} disponível{availableCount === 1 ? "" : "eis"}
              </p>
            ) : null}
          </div>
        </header>
        <div className="p-3 sm:p-4">
          <EventRosterAssignments
            event={event}
            canManage={!readOnly}
            embedded
          />
        </div>
      </section>

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
