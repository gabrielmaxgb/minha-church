"use client";

import { useEffect, useId, useState } from "react";
import { Calendar, Loader2, X } from "lucide-react";

import { ActivityScheduleFields } from "@/components/dashboard/activities/activity-schedule-fields";
import { EventRecurrenceFields } from "@/components/dashboard/activities/event-recurrence-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMinistryEvent } from "@/lib/api/queries";
import {
  buildRecurrencePayload,
  defaultRecurrenceFormState,
  syncRecurrenceDaysWithStart,
  type EventRecurrenceFormState,
} from "@/lib/events/recurrence";
import type { CreateMinistryEventPayload } from "@/types/ministries";

interface CreateMinistryEventModalProps {
  ministryId: string;
  ministryName: string;
  isRoster?: boolean;
  open: boolean;
  onClose: () => void;
}

function defaultStartsAt(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(19, 0, 0, 0);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CreateMinistryEventModal({
  ministryId,
  ministryName,
  isRoster = false,
  open,
  onClose,
}: CreateMinistryEventModalProps) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStartsAt);
  const [endsAt, setEndsAt] = useState("");
  const [rosterOpen, setRosterOpen] = useState(true);
  const [recurrence, setRecurrence] = useState<EventRecurrenceFormState>(
    defaultRecurrenceFormState(defaultStartsAt()),
  );
  const [error, setError] = useState<string | null>(null);
  const createEvent = useCreateMinistryEvent(ministryId);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setLocation("");
      setStartsAt(defaultStartsAt());
      setEndsAt("");
      setRosterOpen(true);
      setRecurrence(defaultRecurrenceFormState(defaultStartsAt()));
      setError(null);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setRecurrence((current) => syncRecurrenceDaysWithStart(current, startsAt));
  }, [startsAt]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !createEvent.isPending) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, createEvent.isPending]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Informe o nome do evento.");
      return;
    }

    const recurrencePayload = buildRecurrencePayload(recurrence);

    if (recurrence.endType === "on_date" && recurrence.repeatMode !== "none" && !recurrence.endDate) {
      setError("Informe a data final da repetição.");
      return;
    }

    const payload: CreateMinistryEventPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      recurrence: recurrencePayload,
      ...(isRoster ? { rosterOpen } : {}),
    };

    try {
      await createEvent.mutateAsync(payload);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar o evento.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Fechar modal"
        disabled={createEvent.isPending}
        onClick={() => {
          if (!createEvent.isPending) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start gap-4 px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Calendar className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight">
              Novo evento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Criar evento para <span className="font-medium text-foreground">{ministryName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createEvent.isPending}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <Separator />

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-border bg-muted/60 px-3 py-2.5 text-sm"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="event-name">Nome do evento</Label>
              <Input
                id="event-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Ensaio, Culto de jovens"
                disabled={createEvent.isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Descrição</Label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Detalhes opcionais"
                rows={2}
                disabled={createEvent.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-location">Local</Label>
              <Input
                id="event-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Ex.: Templo principal"
                disabled={createEvent.isPending}
              />
            </div>

            <ActivityScheduleFields
              idPrefix="event"
              startsAt={startsAt}
              endsAt={endsAt}
              onStartsAtChange={setStartsAt}
              onEndsAtChange={setEndsAt}
              disabled={createEvent.isPending}
            />

            {isRoster && (
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/80 bg-muted/15 px-4 py-3.5">
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-border"
                  checked={rosterOpen}
                  disabled={createEvent.isPending}
                  onChange={(event) => setRosterOpen(event.target.checked)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    Liberar para a equipe marcar disponibilidade
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    A equipe poderá informar se pode ou não servir
                    nesta data (e nas ocorrências da série, se for recorrente).
                  </span>
                </span>
              </label>
            )}

            <EventRecurrenceFields
              value={recurrence}
              onChange={setRecurrence}
              startsAt={startsAt}
              disabled={createEvent.isPending}
            />
          </div>

          <Separator />

          <footer className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createEvent.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createEvent.isPending || !name.trim()}
              className="w-full sm:w-auto"
            >
              {createEvent.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar evento"
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
