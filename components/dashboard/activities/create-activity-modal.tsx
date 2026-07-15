"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calendar, Clock, Eye, FileText, Loader2, MapPin, Repeat, X } from "lucide-react";

import { ActivityScheduleFields } from "@/components/dashboard/activities/activity-schedule-fields";
import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventRecurrenceFields } from "@/components/dashboard/activities/event-recurrence-fields";
import { EventVisibilityFields } from "@/components/dashboard/activities/event-visibility-fields";
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
  canListMinistries,
} from "@/lib/permissions";
import { TrialExpiredWriteModal } from "@/components/dashboard/trial-expired-write-modal";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
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
  /** Valor `datetime-local` inicial (ex.: dia clicado no calendário). */
  defaultStartsAtValue?: string;
  /** Nomes conhecidos sem listar ministérios (ex.: vindos dos eventos). */
  knownMinistryNames?: Record<string, string>;
}

function fallbackStartsAt(): string {
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
  defaultStartsAtValue,
  knownMinistryNames = {},
}: CreateActivityModalProps) {
  const titleId = useId();
  const { permissions } = useAuth();
  const { writesBlocked } = useTrialWriteGuard();
  const canList = canListMinistries(permissions);
  const { data: ministries } = useMinistries({ enabled: open && canList });
  const createEvent = useCreateChurchEvent();

  const [name, setName] = useState("");
  const [ministryId, setMinistryId] = useState(defaultMinistryId);
  const [description, setDescription] = useState("");
  const [highlightNote, setHighlightNote] = useState("");
  const [location, setLocation] = useState("");
  const initialStartsAt = defaultStartsAtValue ?? fallbackStartsAt();
  const [startsAt, setStartsAt] = useState(initialStartsAt);
  const [endsAt, setEndsAt] = useState("");
  const [visibleToChurch, setVisibleToChurch] = useState(true);
  const [recurrence, setRecurrence] = useState<EventRecurrenceFormState>(
    defaultRecurrenceFormState(initialStartsAt),
  );
  const [error, setError] = useState<string | null>(null);

  const creatableMinistries = useMemo(() => {
    if (!permissions) {
      return [];
    }

    const fromList =
      ministries?.filter(
        (ministry) =>
          ministry.isActive &&
          canCreateMinistryActivity(permissions, ministry.id),
      ) ?? [];

    if (fromList.length > 0) {
      return fromList;
    }

    return permissions.activities.ministryIds
      .filter((ministryId) => canCreateMinistryActivity(permissions, ministryId))
      .map((ministryId) => ({
        id: ministryId,
        name: knownMinistryNames[ministryId] ?? "Ministério",
        isActive: true,
      }));
  }, [ministries, permissions, knownMinistryNames]);

  const canSelectChurchWide =
    permissions !== null && canCreateChurchWideActivity(permissions);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        setName("");
        setMinistryId(defaultMinistryId);
        setDescription("");
        setHighlightNote("");
        setLocation("");
        setStartsAt(fallbackStartsAt());
        setEndsAt("");
        setVisibleToChurch(true);
        setRecurrence(defaultRecurrenceFormState(fallbackStartsAt()));
        setError(null);
      }

      wasOpenRef.current = false;
      return;
    }

    const nextStartsAt = defaultStartsAtValue ?? fallbackStartsAt();

    wasOpenRef.current = true;
    // Sem contexto de ministério, o padrão é "Igreja inteira" (church-wide).
    setMinistryId(defaultMinistryId);
    setStartsAt(nextStartsAt);
    setRecurrence(defaultRecurrenceFormState(nextStartsAt));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, defaultMinistryId, defaultStartsAtValue]);

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

  if (writesBlocked) {
    return (
      <TrialExpiredWriteModal
        open
        onClose={onClose}
        action="criar atividades e escalas"
      />
    );
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
      highlightNote: highlightNote.trim() || undefined,
      location: location.trim() || undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      ministryId: ministryId || undefined,
      recurrence: recurrencePayload,
      // Escala fica implícita (padrão do backend). Coleta de disponibilidade
      // e montagem da equipe acontecem na página do evento após a criação.
      ...(ministryId ? { visibleToChurch } : {}),
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
        className="absolute inset-0 bg-black/45"
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
        className="relative z-10 flex max-h-[min(96dvh,920px)] w-full max-w-5xl flex-col rounded-t-xl border border-border bg-background shadow-popover sm:rounded-xl"
      >
        <header className="flex items-start gap-4 px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Calendar className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="text-xl font-semibold tracking-tight">
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
              description="Nome, ministério e detalhes que aparecem na agenda."
              icon={FileText}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-name">Nome</Label>
                  <Input
                    id="activity-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex.: Culto de domingo, Conferência, Ensaio"
                    disabled={createEvent.isPending}
                    autoFocus
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-ministry">Ministério</Label>
                  <SelectField
                    id="activity-ministry"
                    value={ministryId}
                    onChange={(event) => setMinistryId(event.target.value)}
                    disabled={createEvent.isPending}
                    className="h-11 rounded-xl"
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
                      ? "Atividades da igreja aparecem em destaque no painel."
                      : "Selecione um ministério em que você pode criar atividades."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-description">Descrição do evento</Label>
                  <Textarea
                    id="activity-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={2}
                    disabled={createEvent.isPending}
                    className="min-h-[80px] resize-y rounded-xl"
                    placeholder="Detalhes opcionais para a equipe ou participantes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-highlight-note">
                    Recado em destaque
                  </Label>
                  <Textarea
                    id="activity-highlight-note"
                    value={highlightNote}
                    onChange={(event) => setHighlightNote(event.target.value)}
                    rows={2}
                    disabled={createEvent.isPending}
                    className="min-h-[80px] resize-y rounded-xl"
                    placeholder="Ex.: Tema da mensagem: “A fé que move montanhas” — Pr. João"
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparece em destaque na página do evento. Ideal para tema da
                    palavra, pastorais ou avisos importantes.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-location">Local</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="activity-location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      disabled={createEvent.isPending}
                      placeholder="Ex.: Templo principal"
                      className="h-11 rounded-xl pl-10"
                    />
                  </div>
                </div>
              </div>
            </EventFormSection>

            <EventFormSection
              title="Data e horário"
              description="Quando a atividade acontece e por quanto tempo."
              icon={Clock}
            >
              <ActivityScheduleFields
                idPrefix="activity"
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

            {ministryId ? (
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
            ) : null}
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
