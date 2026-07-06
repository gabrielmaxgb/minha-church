"use client";

import { useMemo, useState } from "react";
import { ListChecks, Plus, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { useRemoveEventRoster, useUpsertEventRoster } from "@/lib/api/queries";
import { formatRosterRole, memberCanFillEventRole } from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";
import type { ChurchEventDetail } from "@/types/events";

interface EventRosterAssignmentsProps {
  event: ChurchEventDetail;
  canManage: boolean;
  embedded?: boolean;
}

function availabilityLabel(status: "available" | "unavailable" | null) {
  if (status === "available") {
    return "Disponível";
  }

  if (status === "unavailable") {
    return "Indisponível";
  }

  return "Sem resposta";
}

export function EventRosterAssignments({
  event,
  canManage,
  embedded = false,
}: EventRosterAssignmentsProps) {
  const upsertRoster = useUpsertEventRoster(event.id);
  const removeRoster = useRemoveEventRoster(event.id);
  const [memberId, setMemberId] = useState("");
  const [rosterSlotId, setRosterSlotId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const slots = event.rosterSlots ?? [];
  const vacantSlots = slots.filter((slot) => !slot.assignedMemberId);
  const filledSlots = slots.filter((slot) => slot.assignedMemberId);

  const availableCandidates = useMemo(
    () =>
      event.rosterCandidates.filter(
        (item) => item.availabilityStatus === "available",
      ),
    [event.rosterCandidates],
  );

  const assignedMemberIds = useMemo(
    () => new Set(event.roster.map((item) => item.memberId)),
    [event.roster],
  );

  const selectableCandidates = useMemo(() => {
    const selectedSlot = slots.find((slot) => slot.id === rosterSlotId);

    return availableCandidates.filter((candidate) => {
      if (assignedMemberIds.has(candidate.memberId)) {
        return false;
      }

      if (!selectedSlot) {
        return true;
      }

      return memberCanFillEventRole(
        candidate.roleLabels ?? [],
        selectedSlot.label,
      );
    });
  }, [availableCandidates, assignedMemberIds, rosterSlotId, slots]);

  async function handleAdd() {
    if (!memberId || !rosterSlotId) {
      setError("Escolha a função e a pessoa disponível.");
      return;
    }

    setError(null);

    try {
      await upsertRoster.mutateAsync({ memberId, rosterSlotId });
      setMemberId("");
      setRosterSlotId("");
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Não foi possível adicionar à escala.",
      );
    }
  }

  async function handleRemove(assignmentMemberId: string) {
    setError(null);

    try {
      await removeRoster.mutateAsync(assignmentMemberId);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Não foi possível remover da escala.",
      );
    }
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center">
        <ListChecks className="mx-auto size-7 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Defina as funções primeiro
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          No passo 1, informe quais vagas existem neste evento. Depois você
          escolhe quem vai servir em cada uma.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", !embedded && "space-y-5")}>
      {error && (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {filledSlots.length > 0 && (
        <ul className="space-y-2">
          {filledSlots.map((slot) => {
            const assignment = event.roster.find(
              (item) => item.rosterSlotId === slot.id,
            );

            return (
              <li
                key={slot.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {slot.assignedMemberName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {formatRosterRole(slot.label)}
                    </Badge>
                    {assignment && (
                      <span
                        className={cn(
                          "text-xs",
                          assignment.availabilityStatus === "available" &&
                            "text-emerald-700 dark:text-emerald-300",
                          assignment.availabilityStatus === "unavailable" &&
                            "text-destructive",
                          !assignment.availabilityStatus &&
                            "text-muted-foreground",
                        )}
                      >
                        {availabilityLabel(assignment.availabilityStatus)}
                      </span>
                    )}
                  </div>
                </div>

                {canManage && slot.assignedMemberId && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={removeRoster.isPending}
                    onClick={() => void handleRemove(slot.assignedMemberId!)}
                    aria-label={`Remover ${slot.assignedMemberName} da escala`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {filledSlots.length === 0 && !canManage && (
        <div className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
          A escala deste dia ainda não foi montada.
        </div>
      )}

      {canManage && vacantSlots.length > 0 && (
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Preencher vaga
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Escolha a função e alguém que marcou &ldquo;posso ir&rdquo;.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Função</p>
              <SelectField
                value={rosterSlotId}
                onChange={(changeEvent) => {
                  setRosterSlotId(changeEvent.target.value);
                }}
                disabled={upsertRoster.isPending}
              >
                <option value="">Selecione</option>
                {vacantSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {formatRosterRole(slot.label)}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Pessoa</p>
              <SelectField
                value={memberId}
                onChange={(changeEvent) => setMemberId(changeEvent.target.value)}
                disabled={upsertRoster.isPending}
              >
                <option value="">Selecione</option>
                {selectableCandidates.map((candidate) => (
                  <option key={candidate.memberId} value={candidate.memberId}>
                    {candidate.memberName}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>

          {availableCandidates.length === 0 && (
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Ninguém marcou disponibilidade ainda. Abra a coleta no passo 2 ou
              aguarde as respostas da equipe.
            </p>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => void handleAdd()}
            disabled={upsertRoster.isPending || !memberId || !rosterSlotId}
          >
            <Plus className="size-4" />
            {upsertRoster.isPending ? "Adicionando..." : "Confirmar na escala"}
          </Button>
        </div>
      )}

      {canManage &&
        vacantSlots.length === 0 &&
        filledSlots.length > 0 && (
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            Todas as vagas deste dia estão preenchidas.
          </p>
        )}
    </div>
  );
}

export function EventRosterPublicCard({
  event,
}: {
  event: ChurchEventDetail;
}) {
  const slots = event.rosterSlots ?? [];
  const filledSlots = slots.filter((slot) => slot.assignedMemberId);

  if (!event.usesRoster || filledSlots.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
      <header className="flex items-start gap-3 border-b border-border/60 bg-muted/25 px-5 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
          <Users className="size-4" aria-hidden />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight">
            Equipe escalada
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quem vai servir neste dia.
          </p>
        </div>
      </header>
      <div className="p-5">
        <EventRosterAssignments event={event} canManage={false} embedded />
      </div>
    </section>
  );
}
