"use client";

import { useEffect, useId, useState } from "react";
import { Calendar, Clock, Eye, FileText, Loader2, MapPin, Repeat, X } from "lucide-react";

import { ActivityScheduleFields } from "@/components/dashboard/activities/activity-schedule-fields";
import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventRecurrenceFields } from "@/components/dashboard/activities/event-recurrence-fields";
import { EventVisibilityFields } from "@/components/dashboard/activities/event-visibility-fields";
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
  open,
  onClose,
}: CreateMinistryEventModalProps) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [highlightNote, setHighlightNote] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStartsAt);
  const [endsAt, setEndsAt] = useState("");
  const [visibleToChurch, setVisibleToChurch] = useState(true);
  const [recurrence, setRecurrence] = useState<EventRecurrenceFormState>(
    defaultRecurrenceFormState(defaultStartsAt()),
  );
  const [error, setError] = useState<string | null>(null);
  const createEvent = useCreateMinistryEvent(ministryId);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setHighlightNote("");
      setLocation("");
      setStartsAt(defaultStartsAt());
      setEndsAt("");
      setVisibleToChurch(true);
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
      highlightNote: highlightNote.trim() || undefined,
      location: location.trim() || undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      recurrence: recurrencePayload,
      visibleToChurch,
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
        className="relative z-10 flex max-h-[min(96dvh,920px)] w-full max-w-5xl flex-col rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl"
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
          <div className="space-y-8 overflow-y-auto px-6 py-6">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <EventFormSection
              title="Informações básicas"
              description="Nome e detalhes que a equipe verá na agenda do ministério."
              icon={FileText}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Nome do evento</Label>
                  <Input
                    id="event-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex.: Ensaio, Culto de jovens"
                    disabled={createEvent.isPending}
                    autoFocus
                    className="h-11 rounded-xl"
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
                    className="min-h-[80px] resize-y rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-highlight-note">Recado em destaque</Label>
                  <Textarea
                    id="event-highlight-note"
                    value={highlightNote}
                    onChange={(event) => setHighlightNote(event.target.value)}
                    placeholder='Ex.: Tema da mensagem: "A fé que move montanhas" — Pr. João'
                    rows={2}
                    disabled={createEvent.isPending}
                    className="min-h-[80px] resize-y rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparece em destaque na página do evento. Ideal para tema da
                    palavra, pastorais ou avisos importantes.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-location">Local</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="event-location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Ex.: Templo principal"
                      disabled={createEvent.isPending}
                      className="h-11 rounded-xl pl-10"
                    />
                  </div>
                </div>
              </div>
            </EventFormSection>

            <EventFormSection
              title="Data e horário"
              description="Quando o evento acontece e por quanto tempo."
              icon={Clock}
            >
              <ActivityScheduleFields
                idPrefix="event"
                startsAt={startsAt}
                endsAt={endsAt}
                onStartsAtChange={setStartsAt}
                onEndsAtChange={setEndsAt}
                disabled={createEvent.isPending}
              />
            </EventFormSection>

            <EventFormSection
              title="Repetição"
              description="Opcional. Crie uma série de ocorrências com a mesma configuração."
              icon={Repeat}
            >
              <EventRecurrenceFields
                value={recurrence}
                onChange={setRecurrence}
                startsAt={startsAt}
                disabled={createEvent.isPending}
              />
            </EventFormSection>

            <EventFormSection
              title="Quem pode ver"
              description="Controle se o evento aparece na agenda geral da igreja."
              icon={Eye}
            >
              <EventVisibilityFields
                visibleToChurch={visibleToChurch}
                onVisibleToChurchChange={setVisibleToChurch}
                disabled={createEvent.isPending}
              />
            </EventFormSection>
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
