"use client";

import { useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Repeat,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEventTime } from "@/lib/dashboard/date-utils";
import { useMinistryEvents, useSetRosterCollection } from "@/lib/api/queries";
import {
  buildRosterEventGroups,
  countForScope,
  defaultScopeAnchor,
  resolveCollectionEventIds,
  scopeLabel,
  type RosterCollectionScope,
  type RosterEventGroup,
} from "@/lib/ministries/roster-collection";
import { cn } from "@/lib/utils";
import type { MinistryEvent } from "@/types/ministries";

interface RosterCollectionPanelProps {
  ministryId: string;
  canManage: boolean;
  openEventsCount?: number;
}

function formatEventDay(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

const SCOPE_OPTIONS: RosterCollectionScope[] = [
  "all",
  "monthly",
  "quarterly",
  "semiannual",
  "custom",
];

export function RosterCollectionPanel({
  ministryId,
  canManage,
  openEventsCount = 0,
}: RosterCollectionPanelProps) {
  const setCollection = useSetRosterCollection(ministryId);
  const { data: events, isLoading } = useMinistryEvents(ministryId);

  const groups = useMemo(
    () => buildRosterEventGroups(events ?? []),
    [events],
  );

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [scope, setScope] = useState<RosterCollectionScope>("all");
  const [customIds, setCustomIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const activeGroup = groups.find((group) => group.key === activeKey) ?? null;
  const scopeAnchor = activeGroup
    ? defaultScopeAnchor(activeGroup.occurrences)
    : new Date();

  const selectedCount = activeGroup
    ? countForScope(activeGroup.occurrences, scope, scopeAnchor)
    : 0;

  const resolvedIds = activeGroup
    ? resolveCollectionEventIds(
        activeGroup.occurrences,
        scope,
        customIds,
        scopeAnchor,
      )
    : [];

  function toggleGroup(group: RosterEventGroup) {
    if (activeKey === group.key) {
      setActiveKey(null);
      setError(null);
      return;
    }

    setActiveKey(group.key);
    setScope(group.isRecurring && group.occurrences.length > 1 ? "monthly" : "all");
    setCustomIds(new Set());
    setError(null);
  }

  function toggleCustomDate(eventId: string) {
    setCustomIds((current) => {
      const next = new Set(current);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }

  async function applyCollection(rosterOpen: boolean) {
    if (!activeGroup) {
      setError("Selecione um evento na lista.");
      return;
    }

    const eventIds = resolveCollectionEventIds(
      activeGroup.occurrences,
      scope,
      customIds,
      scopeAnchor,
    );

    if (eventIds.length === 0) {
      setError(
        rosterOpen
          ? "Nenhuma data selecionada para abrir."
          : "Nenhuma data selecionada para fechar.",
      );
      return;
    }

    setError(null);

    try {
      await setCollection.mutateAsync({ rosterOpen, eventIds });
    } catch (batchError) {
      setError(
        batchError instanceof Error
          ? batchError.message
          : "Não foi possível atualizar a coleta de disponibilidade.",
      );
    }
  }

  if (!canManage) {
    if (openEventsCount === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-5 py-6 text-center">
          <CalendarCheck className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium text-foreground">
            Nenhuma data liberada ainda
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Quando o líder abrir a coleta de disponibilidade de um evento, você poderá marcar sua
            disponibilidade nas datas abaixo.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Coleta de disponibilidade aberta
        </p>
        <p className="mt-1 font-display text-lg font-bold text-foreground">
          {openEventsCount} data{openEventsCount === 1 ? "" : "s"} para responder
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Marque nos cartões abaixo em quais dias você pode servir.
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
      <header className="border-b border-border/60 bg-muted/25 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
            <CalendarCheck className="size-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">
              Liberar coleta de disponibilidade
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Escolha um evento, defina o alcance das datas e toque em{" "}
              <strong className="font-medium text-foreground">Abrir coleta de disponibilidade</strong>.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-5">
        {error && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum evento futuro com escala. Crie um evento com &quot;Este evento
            usa escala&quot; marcado.
          </div>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <GroupCard
                key={group.key}
                group={group}
                expanded={activeKey === group.key}
                scope={scope}
                scopeAnchor={scopeAnchor}
                customIds={customIds}
                selectedCount={activeKey === group.key ? selectedCount : 0}
                resolvedCount={
                  activeKey === group.key ? resolvedIds.length : 0
                }
                busy={setCollection.isPending}
                onOpen={() => toggleGroup(group)}
                onScopeChange={setScope}
                onToggleCustom={toggleCustomDate}
                onApply={applyCollection}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function GroupCard({
  group,
  expanded,
  scope,
  scopeAnchor,
  customIds,
  selectedCount,
  resolvedCount,
  busy,
  onOpen,
  onScopeChange,
  onToggleCustom,
  onApply,
}: {
  group: RosterEventGroup;
  expanded: boolean;
  scope: RosterCollectionScope;
  scopeAnchor: Date;
  customIds: Set<string>;
  selectedCount: number;
  resolvedCount: number;
  busy: boolean;
  onOpen: () => void;
  onScopeChange: (scope: RosterCollectionScope) => void;
  onToggleCustom: (eventId: string) => void;
  onApply: (rosterOpen: boolean) => void;
}) {
  const isSeries = group.isRecurring && group.occurrences.length > 1;
  const nextDate = group.occurrences[0];

  return (
    <li className="overflow-hidden rounded-xl border border-border/70 bg-background">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
          expanded ? "bg-muted/25" : "hover:bg-muted/15",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        >
          <ChevronDown className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{group.name}</span>
            {group.isRecurring && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Repeat className="size-2.5" />
                Série · {group.occurrences.length} datas
              </Badge>
            )}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {nextDate
              ? `Próxima: ${formatEventDay(nextDate.startsAt)} · ${formatEventTime(nextDate.startsAt)}`
              : ""}
            {group.openCount > 0
              ? ` · ${group.openCount} aberta${group.openCount === 1 ? "" : "s"}`
              : " · coleta de disponibilidade fechada"}
          </span>
        </span>

        {group.openCount > 0 ? (
          <Badge className="shrink-0 gap-1 bg-emerald-600 hover:bg-emerald-600">
            <CheckCircle2 className="size-3" />
            Aberta
          </Badge>
        ) : (
          <Badge variant="outline" className="shrink-0 gap-1 text-muted-foreground">
            <CircleDashed className="size-3" />
            Fechada
          </Badge>
        )}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border/60 bg-muted/10 px-4 py-4">
          {isSeries ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Para quais datas?
              </p>
              <div className="space-y-1.5">
                {SCOPE_OPTIONS.map((option) => {
                  const count = countForScope(
                    group.occurrences,
                    option,
                    scopeAnchor,
                  );

                  if (option !== "custom" && count === 0) {
                    return null;
                  }

                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        scope === option
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/60 bg-background hover:bg-muted/20",
                      )}
                    >
                      <input
                        type="radio"
                        name={`scope-${group.key}`}
                        className="size-4 accent-primary"
                        checked={scope === option}
                        onChange={() => onScopeChange(option)}
                      />
                      <span className="flex-1 text-foreground">
                        {scopeLabel(option, scopeAnchor)}
                      </span>
                      {option !== "custom" && (
                        <span className="text-xs text-muted-foreground">
                          {count} data{count === 1 ? "" : "s"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Uma única data:{" "}
              <span className="font-medium capitalize text-foreground">
                {formatEventDay(group.occurrences[0].startsAt)}
              </span>
            </p>
          )}

          {isSeries && scope === "custom" && (
            <ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-border/60 bg-background p-2">
              {group.occurrences.map((event) => (
                <DateCheckRow
                  key={event.id}
                  event={event}
                  checked={customIds.has(event.id)}
                  onToggle={() => onToggleCustom(event.id)}
                />
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              disabled={busy || resolvedCount === 0}
              onClick={() => void onApply(true)}
            >
              {busy
                ? "Abrindo..."
                : `Abrir coleta de disponibilidade${resolvedCount > 0 ? ` (${resolvedCount})` : ""}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={busy || resolvedCount === 0}
              onClick={() => void onApply(false)}
            >
              {busy ? "Fechando..." : "Fechar coleta de disponibilidade"}
            </Button>
          </div>

          {selectedCount === 0 && scope !== "custom" && (
            <p className="text-center text-xs text-muted-foreground">
              Nenhuma data futura neste alcance.
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function DateCheckRow({
  event,
  checked,
  onToggle,
}: {
  event: MinistryEvent;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 hover:bg-muted/30">
        <input
          type="checkbox"
          className="size-4 rounded border-border"
          checked={checked}
          onChange={onToggle}
        />
        <span className="flex-1 text-sm capitalize text-foreground">
          {formatEventDay(event.startsAt)}
        </span>
        {event.rosterOpen ? (
          <span className="text-[10px] font-medium text-emerald-700">aberta</span>
        ) : null}
      </label>
    </li>
  );
}
