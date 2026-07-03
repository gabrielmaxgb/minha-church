"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calendar, Loader2, X } from "lucide-react";

import { EventRecurrenceFields } from "@/components/dashboard/activities/event-recurrence-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateChurchEvent, useMinistries } from "@/lib/api/queries";
import {
  canCreateChurchWideActivity,
  canCreateMinistryActivity,
} from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import {
  buildRecurrencePayload,
  defaultRecurrenceFormState,
  syncRecurrenceDaysWithStart,
  type EventRecurrenceFormState,
} from "@/lib/events/recurrence";
import type { CreateChurchEventPayload } from "@/types/events";

interface CreateActivityModalProps {
  open: boolean;
  onClose: () => void;
  defaultMinistryId?: string;
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

export function CreateActivityModal({
  open,
  onClose,
  defaultMinistryId = "",
}: CreateActivityModalProps) {
  const titleId = useId();
  const { permissions } = useAuth();
  const { data: ministries } = useMinistries();
  const createEvent = useCreateChurchEvent();

  const [name, setName] = useState("");
  const [ministryId, setMinistryId] = useState(defaultMinistryId);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStartsAt);
  const [endsAt, setEndsAt] = useState("");
  const [recurrence, setRecurrence] = useState<EventRecurrenceFormState>(
    defaultRecurrenceFormState(defaultStartsAt()),
  );
  const [error, setError] = useState<string | null>(null);

  const creatableMinistries = useMemo(
    () =>
      ministries?.filter(
        (ministry) =>
          ministry.isActive &&
          permissions &&
          canCreateMinistryActivity(permissions, ministry.id),
      ) ?? [],
    [ministries, permissions],
  );

  const canSelectChurchWide =
    permissions !== null && canCreateChurchWideActivity(permissions);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        setName("");
        setMinistryId(defaultMinistryId);
        setDescription("");
        setLocation("");
        setStartsAt(defaultStartsAt());
        setEndsAt("");
        setRecurrence(defaultRecurrenceFormState(defaultStartsAt()));
        setError(null);
      }

      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    setMinistryId(defaultMinistryId);

    if (!defaultMinistryId && creatableMinistries.length === 1) {
      setMinistryId(creatableMinistries[0].id);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, defaultMinistryId, creatableMinistries]);

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
      setError("Informe o nome da atividade.");
      return;
    }

    const recurrencePayload = buildRecurrencePayload(recurrence);

    if (recurrence.endType === "on_date" && recurrence.repeatMode !== "none" && !recurrence.endDate) {
      setError("Informe a data final da repetição.");
      return;
    }

    const payload: CreateChurchEventPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      ministryId: ministryId || undefined,
      recurrence: recurrencePayload,
    };

    try {
      await createEvent.mutateAsync(payload);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar a atividade.",
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
              Nova atividade
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deixe sem ministério para destacar como atividade da igreja inteira.
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
              <Label htmlFor="activity-name">Nome</Label>
              <Input
                id="activity-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Culto de domingo, Conferência, Ensaio"
                disabled={createEvent.isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-ministry">Ministério</Label>
              <SelectField
                id="activity-ministry"
                value={ministryId}
                onChange={(event) => setMinistryId(event.target.value)}
                disabled={createEvent.isPending}
              >
                {canSelectChurchWide && (
                  <option value="">Igreja inteira (destaque)</option>
                )}
                {creatableMinistries.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))}
              </SelectField>
              <p className="text-xs text-muted-foreground">
                {canSelectChurchWide
                  ? "Atividades da igreja aparecem em destaque no painel e em Atividades."
                  : "Selecione um ministério em que você pode criar atividades."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-description">Descrição</Label>
              <Textarea
                id="activity-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                disabled={createEvent.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-location">Local</Label>
              <Input
                id="activity-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                disabled={createEvent.isPending}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activity-starts-at">Início</Label>
                <Input
                  id="activity-starts-at"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  disabled={createEvent.isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-ends-at">Término (opcional)</Label>
                <Input
                  id="activity-ends-at"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                  disabled={createEvent.isPending}
                />
              </div>
            </div>

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
                "Criar atividade"
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
