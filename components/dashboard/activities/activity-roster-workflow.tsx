"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";

import { EventCollectionControls } from "@/components/dashboard/activities/event-collection-controls";
import { EventMutationScopeFields } from "@/components/dashboard/activities/event-mutation-scope-fields";
import { EventRosterAssignments } from "@/components/dashboard/activities/event-roster-assignments";
import { EventRosterOptionsFields } from "@/components/dashboard/activities/event-roster-options-fields";
import { WorkflowStep } from "@/components/dashboard/activities/workflow-step";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  countFilledRosterPositions,
  countRequiredRosterPositions,
  isRosterFullyStaffed,
  rosterSlotPlanEqual,
  rosterSlotsToPlan,
  type RosterSlotPlanItem,
} from "@/lib/ministries/roster";
import {
  useSetEventRosterCollection,
  useUpdateChurchEvent,
} from "@/lib/api/queries";
import type { ChurchEventDetail, EventMutationScope } from "@/types/events";

interface ActivityRosterWorkflowProps {
  event: ChurchEventDetail;
}

function RosterWorkflowSummary({ event }: { event: ChurchEventDetail }) {
  const slots = event.rosterSlots ?? [];
  const filled = countFilledRosterPositions(slots);
  const total = countRequiredRosterPositions(slots);

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={event.usesRoster ? "default" : "secondary"}>
        {event.usesRoster ? "Escala ativa" : "Sem escala"}
      </Badge>
      {event.usesRoster && (
        <Badge
          variant={event.rosterOpen ? "default" : "outline"}
          className={
            event.rosterOpen
              ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : undefined
          }
        >
          Coleta {event.rosterOpen ? "aberta" : "fechada"}
        </Badge>
      )}
      {event.usesRoster && total > 0 && (
        <Badge variant="outline">
          {filled}/{total} vagas preenchidas
        </Badge>
      )}
    </div>
  );
}

export function ActivityRosterWorkflow({ event }: ActivityRosterWorkflowProps) {
  const updateEvent = useUpdateChurchEvent(event.id);
  const setCollection = useSetEventRosterCollection(event.id);

  const [usesRoster, setUsesRoster] = useState(event.usesRoster);
  const [rosterSlotPlan, setRosterSlotPlan] = useState<RosterSlotPlanItem[]>(
    rosterSlotsToPlan(event.rosterSlots ?? []),
  );
  const [availabilityMessage, setAvailabilityMessage] = useState(
    event.availabilityMessage ?? "",
  );
  const [settingsScope, setSettingsScope] = useState<EventMutationScope>("this");
  const [planError, setPlanError] = useState<string | null>(null);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  const isRecurring = Boolean(event.recurrence);
  const slots = event.rosterSlots ?? [];

  useEffect(() => {
    setUsesRoster(event.usesRoster);
    setRosterSlotPlan(rosterSlotsToPlan(event.rosterSlots ?? []));
    setAvailabilityMessage(event.availabilityMessage ?? "");
    setSettingsScope("this");
    setPlanError(null);
    setCollectionError(null);
  }, [event.id, event.usesRoster, event.rosterSlots, event.availabilityMessage]);

  const planDirty =
    usesRoster !== event.usesRoster ||
    !rosterSlotPlanEqual(
      rosterSlotPlan,
      rosterSlotsToPlan(event.rosterSlots ?? []),
    ) ||
    (availabilityMessage.trim() || "") !== (event.availabilityMessage ?? "");

  const hasCollectionTargets = useMemo(() => {
    const futureWithRoster = event.seriesOccurrences.filter(
      (occurrence) =>
        occurrence.usesRoster &&
        new Date(occurrence.startsAt).getTime() >= Date.now(),
    );

    if (futureWithRoster.length > 0) {
      return true;
    }

    return (
      event.usesRoster && new Date(event.startsAt).getTime() >= Date.now()
    );
  }, [event]);

  const step1Complete = event.usesRoster && slots.length > 0;
  const step2Complete = event.usesRoster && event.rosterOpen;
  const step3Complete =
    event.usesRoster && slots.length > 0 && isRosterFullyStaffed(slots);

  async function handleSavePlan() {
    setPlanError(null);

    try {
      await updateEvent.mutateAsync({
        usesRoster,
        rosterOpen: usesRoster ? event.rosterOpen : false,
        rosterSlotPlan: usesRoster ? rosterSlotPlan : [],
        availabilityMessage: usesRoster
          ? availabilityMessage.trim() || null
          : null,
        ...(isRecurring ? { scope: settingsScope } : {}),
      });
    } catch (saveError) {
      setPlanError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o planejamento.",
      );
    }
  }

  async function handleApplyCollection(
    rosterOpenValue: boolean,
    eventIds: string[],
  ) {
    setCollectionError(null);

    try {
      await setCollection.mutateAsync({ rosterOpen: rosterOpenValue, eventIds });
    } catch (collectionApplyError) {
      setCollectionError(
        collectionApplyError instanceof Error
          ? collectionApplyError.message
          : "Não foi possível atualizar a coleta.",
      );
    }
  }

  const planBusy = updateEvent.isPending;
  const collectionBusy = setCollection.isPending;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <ClipboardList className="size-4" />
            Escala deste evento
          </CardTitle>
          <CardDescription className="mt-1.5">
            Três passos: planeje as vagas, peça disponibilidade da equipe e
            confirme quem vai servir nesta data.
          </CardDescription>
        </div>
        <RosterWorkflowSummary event={event} />
      </CardHeader>

      <CardContent className="space-y-8">
        <WorkflowStep
          step={1}
          title="Planejar vagas"
          description="Decida se este dia terá escala e quais funções precisam de alguém."
          complete={step1Complete}
        >
          {planError && (
            <p className="mb-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {planError}
            </p>
          )}

          <EventRosterOptionsFields
            usesRoster={usesRoster}
            rosterOpen={event.rosterOpen}
            rosterSlotPlan={rosterSlotPlan}
            availabilityMessage={availabilityMessage}
            onUsesRosterChange={setUsesRoster}
            onRosterOpenChange={() => undefined}
            onRosterSlotPlanChange={setRosterSlotPlan}
            onAvailabilityMessageChange={setAvailabilityMessage}
            disabled={planBusy}
            hideCollectionToggle
          />

          {planDirty && (
            <div className="mt-4 space-y-3 rounded-xl border border-border/70 bg-muted/10 p-4">
              {isRecurring && (
                <EventMutationScopeFields
                  name={`plan-scope-${event.id}`}
                  value={settingsScope}
                  onChange={setSettingsScope}
                  disabled={planBusy}
                  actionLabel="edit"
                />
              )}
              <Button
                type="button"
                size="sm"
                disabled={planBusy}
                onClick={() => void handleSavePlan()}
              >
                {planBusy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar planejamento"
                )}
              </Button>
            </div>
          )}
        </WorkflowStep>

        <WorkflowStep
          step={2}
          title="Coletar disponibilidade"
          description="Abra a coleta para a equipe informar se pode ir. Feche quando tiver respostas suficientes."
          complete={step2Complete}
          disabled={!event.usesRoster}
        >
          {!event.usesRoster ? (
            <p className="text-sm text-muted-foreground">
              Ative a escala no passo 1 para liberar a coleta.
            </p>
          ) : !hasCollectionTargets ? (
            <p className="text-sm text-muted-foreground">
              Não há datas futuras para abrir coleta neste evento.
            </p>
          ) : (
            <>
              {collectionError && (
                <p className="mb-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {collectionError}
                </p>
              )}
              <EventCollectionControls
                event={event}
                seriesOccurrences={event.seriesOccurrences}
                busy={collectionBusy}
                onApply={(open, eventIds) =>
                  void handleApplyCollection(open, eventIds)
                }
                embedded
              />
            </>
          )}
        </WorkflowStep>

        <WorkflowStep
          step={3}
          title="Confirmar equipe"
          description="Escolha quem vai servir em cada função, entre quem marcou disponibilidade."
          complete={step3Complete}
          disabled={!event.usesRoster}
        >
          {!event.usesRoster ? (
            <p className="text-sm text-muted-foreground">
              Ative a escala no passo 1 para montar a equipe.
            </p>
          ) : (
            <EventRosterAssignments
              event={event}
              canManage
              embedded
            />
          )}
        </WorkflowStep>
      </CardContent>
    </Card>
  );
}
