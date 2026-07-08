"use client";

import { useMemo, useState } from "react";
import { ListChecks, Plus, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useRemoveEventRoster,
  useUpsertEventRoster,
} from "@/lib/api/queries";
import { formatRosterRole, resolveChurchWideCandidateRoleLabels } from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";
import type { ChurchEventDetail } from "@/types/events";

interface EventRosterAssignmentsProps {
  event: ChurchEventDetail;
  canManage: boolean;
  embedded?: boolean;
  compact?: boolean;
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
  compact = false,
}: EventRosterAssignmentsProps) {
  const upsertRoster = useUpsertEventRoster(event.id);
  const removeRoster = useRemoveEventRoster(event.id);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const assignments = event.roster;
  const isMinistryEvent = Boolean(event.ministryId);

  const assignedMemberIds = useMemo(
    () => new Set(assignments.map((item) => item.memberId)),
    [assignments],
  );

  const churchWideSlotLabels = useMemo(
    () => (event.rosterSlots ?? []).map((slot) => slot.label),
    [event.rosterSlots],
  );

  const availableCandidates = useMemo(
    () =>
      event.rosterCandidates
        .filter(
          (candidate) =>
            candidate.availabilityStatus === "available" &&
            !assignedMemberIds.has(candidate.memberId),
        )
        .map((candidate) => ({
          ...candidate,
          roleLabels: isMinistryEvent
            ? candidate.roleLabels
            : resolveChurchWideCandidateRoleLabels(
                candidate.roleLabels,
                churchWideSlotLabels,
              ),
        }))
        .filter((candidate) => candidate.roleLabels.length > 0),
    [assignedMemberIds, churchWideSlotLabels, event.rosterCandidates, isMinistryEvent],
  );

  const rosterBusy = upsertRoster.isPending || removeRoster.isPending;

  function resolveSelectedRole(memberId: string, roleLabels: string[]): string {
    const fromState = selectedRoles[memberId];

    if (fromState) {
      return fromState;
    }

    return roleLabels.length === 1 ? roleLabels[0] : "";
  }

  function selectRole(memberId: string, roleLabel: string) {
    setSelectedRoles((current) => ({
      ...current,
      [memberId]: roleLabel,
    }));
    setError(null);
  }

  async function handleAdd(memberId: string, roleLabels: string[]) {
    const roleLabel = resolveSelectedRole(memberId, roleLabels);

    if (!roleLabel) {
      setError("Selecione uma função antes de adicionar.");
      return;
    }

    setError(null);

    try {
      await upsertRoster.mutateAsync({ memberId, roleLabel });
      setSelectedRoles((current) => {
        const next = { ...current };
        delete next[memberId];
        return next;
      });
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

  return (
    <div
      className={cn(
        compact ? "space-y-2.5" : "space-y-4",
        !embedded && "space-y-5",
      )}
    >
      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {assignments.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Escala oficial
          </p>
          <ul className="space-y-2">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Badge variant="secondary" className="shrink-0">
                    {formatRosterRole(assignment.roleLabel)}
                  </Badge>
                  <span className="truncate font-medium text-foreground">
                    {assignment.memberName}
                  </span>
                </div>

                {canManage ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={removeRoster.isPending}
                    onClick={() => void handleRemove(assignment.memberId)}
                    aria-label={`Remover ${assignment.memberName} da escala`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : canManage ? null : (
        <div className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
          A escala deste dia ainda não foi montada.
        </div>
      )}

      {canManage ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Disponíveis para escalar
            </p>
            {availableCandidates.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Selecione a função e depois clique em Adicionar à escala.
              </p>
            ) : null}
          </div>

          {availableCandidates.length > 0 ? (
            <ul className="space-y-3">
              {availableCandidates.map((candidate) => {
                const selectedRole = resolveSelectedRole(
                  candidate.memberId,
                  candidate.roleLabels,
                );

                return (
                  <li
                    key={candidate.memberId}
                    className="rounded-xl border border-border/70 bg-background px-4 py-3"
                  >
                    <p className="font-medium text-foreground">
                      {candidate.memberName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {candidate.roleLabels.map((role) => {
                        const active = selectedRole === role;

                        return (
                          <button
                            key={`${candidate.memberId}-${role}`}
                            type="button"
                            disabled={rosterBusy}
                            onClick={() => selectRole(candidate.memberId, role)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-muted/20 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                            )}
                          >
                            {formatRosterRole(role)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        disabled={rosterBusy || !selectedRole}
                        onClick={() =>
                          void handleAdd(candidate.memberId, candidate.roleLabels)
                        }
                      >
                        <Plus className="size-4" />
                        Adicionar à escala
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-6 text-center">
              <ListChecks className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Ninguém disponível no momento
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isMinistryEvent
                  ? "A equipe precisa marcar disponibilidade e configurar funções no perfil."
                  : "Ninguém marcou disponibilidade nesta data ainda, ou a coleta está aberta em outra ocorrência da série."}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function EventRosterPublicCard({
  event,
}: {
  event: ChurchEventDetail;
}) {
  if (!event.usesRoster || event.roster.length === 0) {
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
