"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Repeat,
  Sparkles,
  Ticket,
  Trash2,
  X,
} from "lucide-react";

import { ActivityScheduleFields } from "@/components/dashboard/activities/activity-schedule-fields";
import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventMutationScopeFields } from "@/components/dashboard/activities/event-mutation-scope-fields";
import { EventOptionCard } from "@/components/dashboard/activities/event-option-card";
import { EventRecurrenceFields } from "@/components/dashboard/activities/event-recurrence-fields";
import { EventVisibilityFields } from "@/components/dashboard/activities/event-visibility-fields";
import {
  PaidRegistrationReceivablesHint,
  usePaidEventRegistrationGate,
} from "@/components/dashboard/activities/paid-registration-receivables-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteChurchEvent,
  useUpdateChurchEvent,
} from "@/lib/api/queries";
import { toDatetimeLocalValue } from "@/lib/activities/datetime";
import {
  buildRecurrencePayload,
  defaultRecurrenceFormState,
  recurrenceFormStateFromEvent,
  recurrenceFormStatesEqual,
  syncRecurrenceDaysWithStart,
  type EventRecurrenceFormState,
} from "@/lib/events/recurrence";
import {
  applyBrlCentsMask,
  cn,
  formatBrlCentsMask,
  formatDateTime,
  parseBrlMaskToCents,
} from "@/lib/utils";
import type { ChurchEvent, EventMutationScope } from "@/types/events";
import { canCreateChurchWideActivity } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

interface EditActivityModalProps {
  event: ChurchEvent | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EditActivityModal({
  event,
  open,
  onClose,
  onDeleted,
}: EditActivityModalProps) {
  const titleId = useId();
  const { permissions } = useAuth();
  const canSelectChurchWide =
    permissions !== null && canCreateChurchWideActivity(permissions);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [highlightNote, setHighlightNote] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [visibleToChurch, setVisibleToChurch] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [priceReais, setPriceReais] = useState("");
  const [recurrence, setRecurrence] = useState<EventRecurrenceFormState>(
    defaultRecurrenceFormState(new Date().toISOString()),
  );
  const [initialRecurrence, setInitialRecurrence] =
    useState<EventRecurrenceFormState>(
      defaultRecurrenceFormState(new Date().toISOString()),
    );
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editScope, setEditScope] = useState<EventMutationScope>("this");
  const [deleteScope, setDeleteScope] = useState<EventMutationScope>("this");

  const updateEvent = useUpdateChurchEvent(event?.id ?? "");
  const {
    canChargePaidRegistration,
    receivablesHref,
    isPending: connectPending,
  } = usePaidEventRegistrationGate();
  const deleteEvent = useDeleteChurchEvent(event?.id ?? "");
  const isPending = updateEvent.isPending || deleteEvent.isPending;
  const isRecurring = Boolean(event?.recurrenceSeriesId && event?.recurrence);
  const recurrenceChanged = !recurrenceFormStatesEqual(
    recurrence,
    initialRecurrence,
  );
  const recurrenceRequiresSeriesScope = recurrenceChanged && isRecurring;

  const hasChanges = useMemo(() => {
    if (!event) {
      return false;
    }

    return (
      name.trim() !== event.name ||
      (description.trim() || "") !== (event.description ?? "") ||
      (highlightNote.trim() || "") !== (event.highlightNote ?? "") ||
      (location.trim() || "") !== (event.location ?? "") ||
      startsAt !== toDatetimeLocalValue(event.startsAt) ||
      (endsAt || "") !==
        (event.endsAt ? toDatetimeLocalValue(event.endsAt) : "") ||
      visibleToChurch !== (event.visibleToChurch ?? true) ||
      recurrenceChanged
    );
  }, [
    event,
    name,
    description,
    highlightNote,
    location,
    startsAt,
    endsAt,
    visibleToChurch,
    recurrenceChanged,
  ]);

  useEffect(() => {
    if (!open || !event) {
      setName("");
      setDescription("");
      setHighlightNote("");
      setLocation("");
      setStartsAt("");
      setEndsAt("");
      setVisibleToChurch(true);
      setRecurrence(defaultRecurrenceFormState(new Date().toISOString()));
      setInitialRecurrence(defaultRecurrenceFormState(new Date().toISOString()));
      setError(null);
      setConfirmDelete(false);
      setEditScope("this");
      setDeleteScope("this");
      return;
    }

    const nextStarts = toDatetimeLocalValue(event.startsAt);
    const nextRecurrence = recurrenceFormStateFromEvent(
      event.recurrence,
      nextStarts,
    );

    setName(event.name);
    setDescription(event.description ?? "");
    setHighlightNote(event.highlightNote ?? "");
    setLocation(event.location ?? "");
    setStartsAt(nextStarts);
    setEndsAt(event.endsAt ? toDatetimeLocalValue(event.endsAt) : "");
    setVisibleToChurch(event.visibleToChurch ?? true);
    setRegistrationOpen(
      event.registrationOpen ??
        Boolean(event.priceCents && event.priceCents > 0),
    );
    setPriceReais(
      event.priceCents && event.priceCents > 0
        ? formatBrlCentsMask(event.priceCents)
        : "",
    );
    setRecurrence(nextRecurrence);
    setInitialRecurrence(nextRecurrence);
    setError(null);
    setConfirmDelete(false);
    setEditScope("this");
    setDeleteScope("this");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, event]);

  useEffect(() => {
    if (!recurrenceRequiresSeriesScope) {
      return;
    }

    if (editScope === "this") {
      setEditScope("this_and_following");
    }
  }, [recurrenceRequiresSeriesScope, editScope]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape" && !isPending) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, isPending]);

  if (!open || !event) {
    return null;
  }

  async function handleSubmit(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    setError(null);

    if (!event) {
      return;
    }

    if (!name.trim()) {
      setError("Informe o nome da atividade.");
      return;
    }

    if (
      recurrence.endType === "on_date" &&
      recurrence.repeatMode !== "none" &&
      !recurrence.endDate
    ) {
      setError("Informe a data final da repetição.");
      return;
    }

    try {
      const recurrencePayload = recurrenceChanged
        ? recurrence.repeatMode === "none"
          ? null
          : buildRecurrencePayload(recurrence)
        : undefined;

      const priceCents = priceReais.trim()
        ? parseBrlMaskToCents(priceReais)
        : null;

      if (
        registrationOpen &&
        priceCents != null &&
        priceCents > 0 &&
        priceCents < 500
      ) {
        setError(
          "O preço mínimo da inscrição paga é R$ 5,00 (ou deixe vazio para gratuita).",
        );
        return;
      }

      const existingPaid =
        event.priceCents != null && event.priceCents >= 500
          ? event.priceCents
          : null;
      const isNewPaidPrice =
        priceCents != null &&
        priceCents >= 500 &&
        priceCents !== existingPaid;

      if (isNewPaidPrice && !canChargePaidRegistration) {
        setError(
          "Ative os recebimentos da igreja antes de abrir inscrição paga.",
        );
        return;
      }

      const openRegistration =
        registrationOpen || Boolean(priceCents != null && priceCents >= 500);

      await updateEvent.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        highlightNote: highlightNote.trim() || null,
        location: location.trim() || null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        visibleToChurch:
          event.ministryId && canSelectChurchWide
            ? visibleToChurch
            : undefined,
        registrationOpen: openRegistration,
        priceCents:
          openRegistration && priceCents != null && priceCents >= 500
            ? priceCents
            : null,
        ...(recurrencePayload !== undefined
          ? { recurrence: recurrencePayload }
          : {}),
        ...(isRecurring
          ? {
              scope: recurrenceRequiresSeriesScope
                ? editScope === "this"
                  ? "this_and_following"
                  : editScope
                : editScope,
            }
          : {}),
      });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar a atividade.",
      );
    }
  }

  async function handleDelete() {
    setError(null);

    try {
      await deleteEvent.mutateAsync(isRecurring ? deleteScope : "this");
      onClose();
      onDeleted?.();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir a atividade.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar modal"
        disabled={isPending}
        onClick={() => {
          if (!isPending) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(94dvh,860px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl border border-border/80 bg-background shadow-popover sm:rounded-xl"
      >
        <header className="relative border-b border-border/80 bg-muted/20 px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="absolute right-5 top-5 rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-50 sm:right-6 sm:top-6"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-col gap-5 pr-12 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
              <Calendar className="size-6" aria-hidden />
            </div>

            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {event.isChurchWide ? (
                  <Badge className="gap-1.5 px-2.5 py-1">
                    <Sparkles className="size-3" />
                    Igreja inteira
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-2.5 py-1">
                    {event.ministryName ?? "Ministério"}
                  </Badge>
                )}
                {event.recurrence && (
                  <Badge variant="secondary">Recorrente</Badge>
                )}
                {hasChanges && (
                  <Badge variant="outline" className="border-attention-border text-attention-foreground">
                    Alterações não salvas
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5">
                <h2
                  id={titleId}
                  className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]"
                >
                  Editar atividade
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Atualize os detalhes de{" "}
                  <span className="font-medium text-foreground">{event.name}</span>.
                  Agendada para{" "}
                  <span className="font-medium text-foreground">
                    {formatDateTime(event.startsAt)}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-10 overflow-y-auto px-6 py-8 sm:px-8">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <EventFormSection
              title="Informações principais"
              description="Nome, descrição e local onde a atividade acontece."
              icon={FileText}
            >
              <div className="space-y-6">
                <Field label="Nome da atividade" htmlFor="edit-activity-name">
                  <Input
                    id="edit-activity-name"
                    value={name}
                    onChange={(inputEvent) => setName(inputEvent.target.value)}
                    placeholder="Ex.: Culto de domingo, Ensaio de louvor"
                    disabled={isPending}
                    autoFocus
                    className="h-12 rounded-xl border-border/80 bg-background px-4 text-base"
                  />
                </Field>

                <Field
                  label="Descrição do evento"
                  htmlFor="edit-activity-description"
                  hint="Opcional. Use para orientar a equipe ou os participantes."
                >
                  <Textarea
                    id="edit-activity-description"
                    value={description}
                    onChange={(inputEvent) => setDescription(inputEvent.target.value)}
                    placeholder="Detalhes, observações ou instruções..."
                    rows={4}
                    disabled={isPending}
                    className="min-h-[120px] resize-y rounded-xl border-border/80 bg-background px-4 py-3 text-base leading-relaxed"
                  />
                </Field>

                <Field
                  label="Recado em destaque"
                  htmlFor="edit-activity-highlight-note"
                  hint="Opcional. Aparece em destaque na página do evento para quem acessa — ideal para tema da palavra, pastorais ou avisos importantes."
                >
                  <Textarea
                    id="edit-activity-highlight-note"
                    value={highlightNote}
                    onChange={(inputEvent) => setHighlightNote(inputEvent.target.value)}
                    placeholder="Ex.: Tema da mensagem: “A fé que move montanhas” — Pr. João"
                    rows={3}
                    disabled={isPending}
                    className="min-h-[92px] resize-y rounded-xl border-border/80 bg-background px-4 py-3 text-base leading-relaxed"
                  />
                </Field>

                <div className="space-y-3">
                  <EventOptionCard
                    type="checkbox"
                    checked={registrationOpen}
                    onChange={(checked) => {
                      setRegistrationOpen(checked);
                      if (!checked) {
                        setPriceReais("");
                      }
                    }}
                    title="Abrir inscrição"
                    description="Membros confirmam participação na página do evento. Pode ser gratuita ou paga."
                    icon={Ticket}
                    disabled={isPending}
                    compact
                  />

                  {registrationOpen ? (
                    <Field
                      label="Preço da inscrição (opcional)"
                      htmlFor="edit-activity-price"
                      hint={
                        canChargePaidRegistration
                          ? "Vazio = inscrição gratuita. Com valor, pagamento via Stripe Connect (mínimo R$ 5,00)."
                          : undefined
                      }
                    >
                      <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
                          R$
                        </span>
                        <Input
                          id="edit-activity-price"
                          inputMode="numeric"
                          autoComplete="off"
                          value={priceReais}
                          onChange={(inputEvent) => {
                            const digits = inputEvent.target.value.replace(
                              /\D/g,
                              "",
                            );
                            setPriceReais(
                              digits
                                ? applyBrlCentsMask(inputEvent.target.value)
                                : "",
                            );
                          }}
                          placeholder="0,00 — vazio = gratuita"
                          disabled={isPending || !canChargePaidRegistration}
                          className="h-12 rounded-xl border-border/80 bg-background pl-11 pr-4 text-base tabular-nums"
                        />
                      </div>
                      {!canChargePaidRegistration && !connectPending ? (
                        <PaidRegistrationReceivablesHint
                          href={receivablesHref}
                        />
                      ) : null}
                    </Field>
                  ) : null}
                </div>

                <Field label="Local" htmlFor="edit-activity-location">
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="edit-activity-location"
                      value={location}
                      onChange={(inputEvent) => setLocation(inputEvent.target.value)}
                      placeholder="Ex.: Templo principal, Sala 2"
                      disabled={isPending}
                      className="h-12 rounded-xl border-border/80 bg-background pl-11 pr-4 text-base"
                    />
                  </div>
                </Field>
              </div>
            </EventFormSection>

            <EventFormSection
              title="Data e horário"
              description="Defina o dia, o horário de início e a duração da atividade."
              icon={Clock}
            >
              <ActivityScheduleFields
                  idPrefix="edit-activity"
                  startsAt={startsAt}
                  endsAt={endsAt}
                  onStartsAtChange={(value) => {
                    setStartsAt(value);
                    setRecurrence((current) =>
                      syncRecurrenceDaysWithStart(current, value),
                    );
                  }}
                  onEndsAtChange={setEndsAt}
                  disabled={isPending}
                  elevated
                />
            </EventFormSection>

            <EventFormSection
              title="Repetição"
              description="Trate a série como um único evento — altere a regra quando precisar, como no Google Agenda."
              icon={Repeat}
            >
              <EventRecurrenceFields
                value={recurrence}
                onChange={setRecurrence}
                startsAt={startsAt}
                disabled={isPending}
              />
            </EventFormSection>

            {event.ministryId && canSelectChurchWide && (
              <EventFormSection
                title="Quem pode ver"
                description="Controle se o evento aparece na agenda geral da igreja."
                icon={Eye}
              >
                <EventVisibilityFields
                  visibleToChurch={visibleToChurch}
                  onVisibleToChurchChange={setVisibleToChurch}
                  allowChurchWideVisibility={canSelectChurchWide}
                  disabled={isPending}
                />
              </EventFormSection>
            )}

            {isRecurring && (
              <EventFormSection
                title="Alcance das alterações"
                description={
                  recurrenceRequiresSeriesScope
                    ? "A regra de repetição mudou — escolha se vale daqui pra frente ou para toda a série."
                    : "Defina se a edição vale só para esta data ou para a série inteira."
                }
                icon={Repeat}
              >
                <EventMutationScopeFields
                  name="edit-event-scope"
                  value={editScope}
                  onChange={setEditScope}
                  disabled={isPending}
                  actionLabel="edit"
                  hideThisOption={recurrenceRequiresSeriesScope}
                />
              </EventFormSection>
            )}

            <EventFormSection
              title="Zona de perigo"
              description="A exclusão remove a atividade da agenda. Essa ação não pode ser desfeita."
              className="border-t border-border/80 pt-2"
              contentClassName="border-destructive/15 bg-destructive/3"
            >
                {confirmDelete ? (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">
                        Excluir &quot;{event.name}&quot;?
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {isRecurring
                          ? "Escolha se a exclusão vale só para esta ocorrência ou para mais eventos da série."
                          : "A atividade deixará de aparecer em Eventos e Atividades e no painel do ministério."}
                      </p>
                    </div>

                    {isRecurring && (
                      <EventMutationScopeFields
                        name="delete-event-scope"
                        value={deleteScope}
                        onChange={setDeleteScope}
                        disabled={isPending}
                        actionLabel="delete"
                      />
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isPending}
                        onClick={handleDelete}
                        className="h-11 rounded-xl px-5"
                      >
                        {deleteEvent.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Excluindo...
                          </>
                        ) : (
                          <>
                            <Trash2 className="size-4" />
                            Confirmar exclusão
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => setConfirmDelete(false)}
                        className="h-11 rounded-xl px-5"
                      >
                        Manter atividade
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => setConfirmDelete(true)}
                    className="h-11 rounded-xl px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Excluir atividade
                  </Button>
                )}
            </EventFormSection>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-border/80 bg-muted/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="hidden text-sm text-muted-foreground sm:block">
              {hasChanges
                ? "Você tem alterações pendentes."
                : "Nenhuma alteração pendente."}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="h-11 w-full rounded-xl px-6 sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !name.trim() || !hasChanges}
                className="h-11 w-full rounded-xl px-6 sm:w-auto"
              >
                {updateEvent.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
