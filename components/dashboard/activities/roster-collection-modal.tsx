"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { LargeModalShell } from "@/components/dashboard/activities/large-modal-shell";
import { Button } from "@/components/ui/button";
import {
  buildMonthGrid,
  formatMonthTitle,
  getWeekdayLabels,
  isSameMonth,
  isToday,
  toDateKey,
} from "@/lib/events/calendar";
import {
  useEventSeriesOccurrences,
  useSetEventRosterCollection,
} from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import type { ChurchEventDetail, EventSeriesOccurrence } from "@/types/events";

interface RosterCollectionModalProps {
  event: ChurchEventDetail | null;
  open: boolean;
  onClose: () => void;
}

function formatOccurrenceShort(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function isFutureOccurrence(startsAt: string): boolean {
  return new Date(startsAt).getTime() >= Date.now();
}

export function RosterCollectionModal({
  event,
  open,
  onClose,
}: RosterCollectionModalProps) {
  const setCollection = useSetEventRosterCollection(event?.id ?? "");
  const seriesId = event?.recurrenceSeriesId;
  const { data: seriesOccurrences = [], isLoading } =
    useEventSeriesOccurrences(seriesId, { enabled: open && Boolean(seriesId) });

  const anchorDate = event ? new Date(event.startsAt) : new Date();
  const [year, setYear] = useState(anchorDate.getFullYear());
  const [monthIndex, setMonthIndex] = useState(anchorDate.getMonth());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !event) {
      return;
    }

    const anchor = new Date(event.startsAt);
    setYear(anchor.getFullYear());
    setMonthIndex(anchor.getMonth());
    setError(null);

    const isSingleOccurrence = !event.recurrenceSeriesId || !event.recurrence;
    setSelectedIds(isSingleOccurrence ? new Set([event.id]) : new Set());
  }, [open, event?.id, event?.startsAt, event?.recurrence, event?.recurrenceSeriesId]);

  const selectableOccurrences = useMemo(() => {
    const items: EventSeriesOccurrence[] =
      seriesOccurrences.length > 0
        ? seriesOccurrences
        : event
          ? [
              {
                id: event.id,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                rosterOpen: event.rosterOpen,
                usesRoster: event.usesRoster,
              },
            ]
          : [];

    return items.filter((item) => isFutureOccurrence(item.startsAt));
  }, [event, seriesOccurrences]);

  const occurrencesByDay = useMemo(() => {
    const map = new Map<string, EventSeriesOccurrence[]>();

    for (const occurrence of selectableOccurrences) {
      const key = toDateKey(new Date(occurrence.startsAt));
      const bucket = map.get(key) ?? [];
      bucket.push(occurrence);
      map.set(key, bucket);
    }

    return map;
  }, [selectableOccurrences]);

  const grid = useMemo(() => buildMonthGrid(year, monthIndex), [year, monthIndex]);

  const selectedOccurrences = useMemo(
    () => selectableOccurrences.filter((item) => selectedIds.has(item.id)),
    [selectableOccurrences, selectedIds],
  );

  function toggleOccurrence(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleDay(dateKey: string) {
    const dayOccurrences = occurrencesByDay.get(dateKey) ?? [];
    if (dayOccurrences.length === 0) {
      return;
    }

    const allSelected = dayOccurrences.every((item) => selectedIds.has(item.id));

    setSelectedIds((current) => {
      const next = new Set(current);

      for (const occurrence of dayOccurrences) {
        if (allSelected) {
          next.delete(occurrence.id);
        } else {
          next.add(occurrence.id);
        }
      }

      return next;
    });
  }

  function selectMonthOccurrences() {
    const ids = selectableOccurrences
      .filter((item) => {
        const date = new Date(item.startsAt);
        return date.getFullYear() === year && date.getMonth() === monthIndex;
      })
      .map((item) => item.id);

    setSelectedIds(new Set(ids));
  }

  function selectAllFuture() {
    setSelectedIds(new Set(selectableOccurrences.map((item) => item.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleApply() {
    if (!event) {
      return;
    }

    const targetIds = isRecurring
      ? selectedOccurrences.map((item) => item.id)
      : [event.id];

    if (targetIds.length === 0) {
      setError("Selecione ao menos uma data.");
      return;
    }

    setError(null);

    try {
      await setCollection.mutateAsync({
        rosterOpen: true,
        eventIds: targetIds,
      });
      onClose();
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "Não foi possível abrir a coleta.",
      );
    }
  }

  if (!event) {
    return null;
  }

  const busy = setCollection.isPending;
  const isRecurring = Boolean(event.recurrenceSeriesId && event.recurrence);
  const isChurchWide = Boolean(event.isChurchWide);

  return (
    <LargeModalShell
      open={open}
      onClose={onClose}
      disabled={busy}
      title="Coleta de disponibilidade"
      subtitle={
        isRecurring
          ? `Selecione as datas de “${event.name}” para abrir a coleta. Para fechar, use o botão na página da atividade.`
          : "Abra a coleta para esta atividade. Para fechar depois, use o botão na página da atividade."
      }
      icon={CalendarCheck}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {isRecurring
              ? selectedOccurrences.length > 0
                ? `${selectedOccurrences.length} data(s) selecionada(s)`
                : "Nenhuma data selecionada"
              : "Coleta será aberta para a data abaixo"}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" disabled={busy} onClick={handleApply}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Abrir coleta
            </Button>
          </div>
        </div>
      }
    >
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {isChurchWide ? (
        <div className="mb-4 rounded-xl border border-domain-members/20 bg-domain-members-subtle/50 px-4 py-3.5 text-sm leading-relaxed text-domain-members-foreground">
          Evento da igreja inteira — quando a coleta estiver aberta,{" "}
          <span className="font-medium">todos os membros</span> poderão se
          voluntariar e marcar disponibilidade.
        </div>
      ) : null}

      {isRecurring ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (monthIndex === 0) {
                  setYear((value) => value - 1);
                  setMonthIndex(11);
                  return;
                }

                setMonthIndex((value) => value - 1);
              }}
              disabled={busy}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[10rem] text-center text-sm font-semibold capitalize">
              {formatMonthTitle(year, monthIndex)}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (monthIndex === 11) {
                  setYear((value) => value + 1);
                  setMonthIndex(0);
                  return;
                }

                setMonthIndex((value) => value + 1);
              }}
              disabled={busy}
            >
              <ChevronRight className="size-4" />
            </Button>

            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={selectMonthOccurrences}
                disabled={busy}
              >
                Todo {formatMonthTitle(year, monthIndex).split(" ")[0]}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={selectAllFuture}
                disabled={busy}
              >
                Todas as futuras
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                disabled={busy}
              >
                Limpar
              </Button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando datas...</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/70">
              <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
                {getWeekdayLabels().map((label) => (
                  <div
                    key={label}
                    className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {grid.map((day) => {
                  const dateKey = toDateKey(day);
                  const dayOccurrences = occurrencesByDay.get(dateKey) ?? [];
                  const inMonth = isSameMonth(day, year, monthIndex);
                  const hasEvents = dayOccurrences.length > 0;
                  const allSelected =
                    hasEvents &&
                    dayOccurrences.every((item) => selectedIds.has(item.id));
                  const someSelected =
                    hasEvents &&
                    dayOccurrences.some((item) => selectedIds.has(item.id));

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      disabled={!hasEvents || busy}
                      onClick={() => toggleDay(dateKey)}
                      className={cn(
                        "min-h-[4.5rem] border-b border-r border-border/40 p-1.5 text-left transition-colors",
                        !inMonth && "bg-muted/15 text-muted-foreground/60",
                        hasEvents && "hover:bg-muted/40",
                        !hasEvents && "cursor-default",
                        allSelected && "bg-primary/10 ring-1 ring-inset ring-primary/25",
                        someSelected && !allSelected && "bg-primary/5",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                          isToday(day) && "bg-foreground text-background",
                        )}
                      >
                        {day.getDate()}
                      </span>
                      {hasEvents ? (
                        <div className="mt-1 space-y-0.5">
                          {dayOccurrences.map((occurrence) => (
                            <span
                              key={occurrence.id}
                              className={cn(
                                "block truncate rounded px-1 py-0.5 text-[10px] font-medium",
                                occurrence.rosterOpen
                                  ? "bg-success-subtle text-success-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {new Intl.DateTimeFormat("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(occurrence.startsAt))}
                              {occurrence.rosterOpen ? " · aberta" : ""}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedOccurrences.length > 0 ? (
            <ul className="mt-4 space-y-1.5">
              {selectedOccurrences.map((occurrence) => (
                <li key={occurrence.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleOccurrence(occurrence.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-left text-sm hover:bg-muted/30"
                  >
                    <span className="capitalize">
                      {formatOccurrenceShort(occurrence.startsAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {occurrence.rosterOpen ? "Coleta aberta" : "Coleta fechada"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <div className="rounded-xl border border-border/70 bg-muted/10 px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ao confirmar, a coleta de disponibilidade será aberta para:
          </p>
          <p className="mt-3 text-2xl font-semibold capitalize tracking-tight text-foreground">
            {formatOccurrenceShort(event.startsAt)}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Esta atividade não se repete.
          </p>
        </div>
      )}
    </LargeModalShell>
  );
}
