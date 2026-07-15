"use client";

import { useMemo, useState } from "react";
import {
  ListChecks,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useRemoveEventRoster,
  useUpsertEventRoster,
} from "@/lib/api/queries";
import {
  prepareRosterAssignableCandidates,
  type RosterCandidateFilter,
} from "@/lib/ministries/roster-candidates";
import {
  formatRosterRole,
  resolveChurchWideCandidateRoleLabels,
  type EventAvailabilityStatus,
} from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";
import type { ChurchEventDetail } from "@/types/events";

interface EventRosterAssignmentsProps {
  event: ChurchEventDetail;
  canManage: boolean;
  embedded?: boolean;
  compact?: boolean;
}

const FILTER_OPTIONS: Array<{ id: RosterCandidateFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "available", label: "Disponíveis" },
  { id: "pending", label: "Sem resposta" },
  { id: "unavailable", label: "Indisponíveis" },
];

function availabilityMeta(status: EventAvailabilityStatus | null): {
  label: string;
  className: string;
  icon: "check" | "x" | "none";
} {
  if (status === "available") {
    return {
      label: "Disponível",
      className: "border-success/35 bg-success-subtle/70",
      icon: "check",
    };
  }

  if (status === "unavailable") {
    return {
      label: "Indisponível",
      className: "border-destructive/20 bg-destructive/5 opacity-80",
      icon: "x",
    };
  }

  return {
    label: "Sem resposta",
    className: "border-border/70 bg-muted/20 opacity-75",
    icon: "none",
  };
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RosterCandidateFilter>("all");

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

  const poolCandidates = useMemo(
    () =>
      event.rosterCandidates
        .filter((candidate) => !assignedMemberIds.has(candidate.memberId))
        .map((candidate) => ({
          ...candidate,
          roleLabels: isMinistryEvent
            ? candidate.roleLabels
            : resolveChurchWideCandidateRoleLabels(
                candidate.roleLabels,
                churchWideSlotLabels,
              ),
        })),
    [
      assignedMemberIds,
      churchWideSlotLabels,
      event.rosterCandidates,
      isMinistryEvent,
    ],
  );

  const visibleCandidates = useMemo(
    () =>
      prepareRosterAssignableCandidates(poolCandidates, {
        filter,
        search,
      }),
    [filter, poolCandidates, search],
  );

  const assignmentsByRole = useMemo(() => {
    const groups = new Map<string, typeof assignments>();

    for (const assignment of assignments) {
      const key = assignment.roleLabel;
      const bucket = groups.get(key) ?? [];
      bucket.push(assignment);
      groups.set(key, bucket);
    }

    return [...groups.entries()].sort(([a], [b]) =>
      formatRosterRole(a).localeCompare(formatRosterRole(b), "pt-BR"),
    );
  }, [assignments]);

  const rosterBusy = upsertRoster.isPending || removeRoster.isPending;
  const showSearch = poolCandidates.length > 6;

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

  const assignedPanel = (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Escala oficial
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {assignments.length}
        </p>
      </div>

      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignmentsByRole.map(([roleLabel, roleAssignments]) => (
            <div key={roleLabel} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {formatRosterRole(roleLabel)}
                <span className="ml-1 tabular-nums opacity-70">
                  · {roleAssignments.length}
                </span>
              </p>
              <ul className="space-y-1.5">
                {roleAssignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-success/30 bg-success-subtle px-3 py-2.5"
                  >
                    <span className="truncate text-sm font-medium text-foreground">
                      {assignment.memberName}
                    </span>

                    {canManage ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="size-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                        disabled={removeRoster.isPending}
                        onClick={() => void handleRemove(assignment.memberId)}
                        aria-label={`Remover ${assignment.memberName} da escala`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
          <Users className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">
            Escala vazia
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {canManage
              ? "Comece pela lista ao lado — dá para escalar mesmo sem resposta."
              : "Ainda não foi montada para este dia."}
          </p>
        </div>
      )}
    </div>
  );

  const poolPanel = canManage ? (
    <div className={cn("space-y-2.5", compact && "space-y-2")}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Adicionar
            <span className="ml-1.5 font-normal tabular-nums normal-case tracking-normal">
              ({poolCandidates.length})
            </span>
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            Escolha a função e adicione.
          </p>
        </div>
        {FILTER_OPTIONS.map((option) => {
          const active = filter === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={cn(
                "rounded-md px-2 py-1 text-xs transition-colors",
                active
                  ? "bg-foreground font-medium text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {poolCandidates.length > 0 ? (
        <>
          {showSearch ? (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(changeEvent) => setSearch(changeEvent.target.value)}
                placeholder="Buscar…"
                className="h-8 pl-8 text-sm"
                aria-label="Buscar pessoa na equipe"
              />
            </div>
          ) : null}

          {visibleCandidates.length > 0 ? (
            <ul className="max-h-112 divide-y divide-border/60 overflow-y-auto rounded-xl border border-border/70 bg-background">
              {visibleCandidates.map((candidate) => {
                const selectedRole = resolveSelectedRole(
                  candidate.memberId,
                  candidate.roleLabels,
                );
                const meta = availabilityMeta(candidate.availabilityStatus);
                const canPickRole = candidate.roleLabels.length > 0;
                const singleRole = candidate.roleLabels.length === 1;
                const roleForAdd = singleRole
                  ? candidate.roleLabels[0]
                  : selectedRole;

                return (
                  <li
                    key={candidate.memberId}
                    className={cn(
                      "px-3 py-2 transition-colors",
                      candidate.availabilityStatus === "unavailable" &&
                        "opacity-55",
                      candidate.availabilityStatus === null && "opacity-80",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 size-2 shrink-0 rounded-full",
                          meta.icon === "check" && "bg-success",
                          meta.icon === "x" && "bg-destructive",
                          meta.icon === "none" && "bg-muted-foreground/35",
                        )}
                        title={meta.label}
                        aria-label={meta.label}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <p className="truncate text-sm font-medium leading-tight text-foreground">
                            {candidate.memberName}
                          </p>
                          <p className="text-[11px] leading-tight text-muted-foreground">
                            {meta.label}
                          </p>
                        </div>

                        {canPickRole && singleRole ? (
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {formatRosterRole(candidate.roleLabels[0])}
                          </p>
                        ) : null}

                        {canPickRole && !singleRole ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {candidate.roleLabels.map((role) => {
                              const active = selectedRole === role;

                              return (
                                <button
                                  key={`${candidate.memberId}-${role}`}
                                  type="button"
                                  disabled={rosterBusy}
                                  onClick={() =>
                                    selectRole(candidate.memberId, role)
                                  }
                                  className={cn(
                                    "rounded-md border px-2 py-0.5 text-[11px] transition-colors disabled:opacity-50",
                                    active
                                      ? "border-foreground/25 bg-muted font-medium text-foreground"
                                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                                  )}
                                >
                                  {formatRosterRole(role)}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}

                        {!canPickRole ? (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Sem funções no perfil
                          </p>
                        ) : null}
                      </div>

                      {canPickRole ? (
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 shrink-0 gap-1 px-2.5"
                          disabled={rosterBusy || !roleForAdd}
                          onClick={() =>
                            void handleAdd(
                              candidate.memberId,
                              candidate.roleLabels,
                            )
                          }
                          aria-label={
                            roleForAdd
                              ? `Adicionar ${candidate.memberName} como ${formatRosterRole(roleForAdd)}`
                              : `Adicionar ${candidate.memberName} à escala`
                          }
                        >
                          <Plus className="size-3.5" />
                          Adicionar
                        </Button>
                      ) : (
                        <span className="size-8 shrink-0" aria-hidden />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-5 text-center">
              <p className="text-sm font-medium text-foreground">
                Ninguém neste filtro
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Troque o filtro ou a busca.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-5 text-center">
          <ListChecks className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">
            Ninguém na equipe ainda
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isMinistryEvent
              ? "Cadastre pessoas no ministério para montar a escala."
              : "Cadastre membros ativos na igreja."}
          </p>
        </div>
      )}
    </div>
  ) : null;

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

      {canManage ? (
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="min-w-0">{assignedPanel}</div>
          <div className="min-w-0">{poolPanel}</div>
        </div>
      ) : (
        assignedPanel
      )}
    </div>
  );
}

export function EventRosterPublicCard({
  event,
  dense = false,
}: {
  event: ChurchEventDetail;
  dense?: boolean;
}) {
  if (!event.usesRoster || event.roster.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <header
        className={cn(
          "flex items-start gap-3 border-b border-border/60",
          dense ? "px-4 py-3" : "px-5 py-4",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
          <Users className="size-4" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Equipe escalada
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {dense
              ? `${event.roster.length} pessoa${event.roster.length === 1 ? "" : "s"} neste dia`
              : "Quem vai servir neste dia."}
          </p>
        </div>
      </header>
      <div
        className={cn(
          dense ? "max-h-56 overflow-y-auto p-3 sm:p-4" : "p-4 sm:p-5",
        )}
      >
        <EventRosterAssignments
          event={event}
          canManage={false}
          embedded
          compact={dense}
        />
      </div>
    </section>
  );
}
