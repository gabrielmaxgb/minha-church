"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calendar, Clock, Eye, FileText, Loader2, MapPin, Repeat, Ticket, X } from "lucide-react";

import { ActivityScheduleFields } from "@/components/dashboard/activities/activity-schedule-fields";
import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventOptionCard } from "@/components/dashboard/activities/event-option-card";
import { EventRecurrenceFields } from "@/components/dashboard/activities/event-recurrence-fields";
import { EventVisibilityFields } from "@/components/dashboard/activities/event-visibility-fields";
import {
  PaidRegistrationReceivablesHint,
  usePaidEventRegistrationGate,
} from "@/components/dashboard/activities/paid-registration-receivables-gate";
import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
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
  applyActivityFormFieldErrors,
  activityFormErrorsNeedMoreOptions,
  activityFormFieldIds,
  mapActivityFormApiError,
  type ActivityFormField,
  type ActivityFormFieldErrors,
} from "@/lib/events/activity-form-errors";
import {
  buildRecurrencePayload,
  defaultRecurrenceFormState,
  syncRecurrenceDaysWithStart,
  type EventRecurrenceFormState,
} from "@/lib/events/recurrence";
import type { CreateChurchEventPayload } from "@/types/events";
import {
  defaultEndsAt,
  isAllDayRange,
  isValidScheduleRange,
} from "@/lib/activities/datetime";
import {
  applyBrlCentsMask,
  parseBrlMaskToCents,
} from "@/lib/utils";

interface CreateActivityModalProps {
  open: boolean;
  onClose: () => void;
  defaultMinistryId?: string;
  /**
   * Trava o ministério (ex.: tela do ministério). Esconde o seletor e usa
   * o mesmo formulário de criação (inclui inscrição).
   */
  fixedMinistryId?: string;
  fixedMinistryName?: string;
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
  fixedMinistryId,
  fixedMinistryName,
  defaultStartsAtValue,
  knownMinistryNames = {},
}: CreateActivityModalProps) {
  const titleId = useId();
  const { permissions } = useAuth();
  const { writesBlocked } = useTrialWriteGuard();
  const lockedMinistryId = fixedMinistryId?.trim() || "";
  const initialMinistryId = lockedMinistryId || defaultMinistryId;
  const canList = canListMinistries(permissions);
  const { data: ministries } = useMinistries({
    enabled: open && canList && !lockedMinistryId,
  });
  const createEvent = useCreateChurchEvent();
  const {
    canChargePaidRegistration,
    receivablesHref,
    isPending: connectPending,
  } = usePaidEventRegistrationGate();

  const [name, setName] = useState("");
  const [ministryId, setMinistryId] = useState(initialMinistryId);
  const [description, setDescription] = useState("");
  const [highlightNote, setHighlightNote] = useState("");
  const [location, setLocation] = useState("");
  const initialStartsAt = defaultStartsAtValue ?? fallbackStartsAt();
  const [startsAt, setStartsAt] = useState(initialStartsAt);
  const [endsAt, setEndsAt] = useState(() => defaultEndsAt(initialStartsAt));
  const [visibleToChurch, setVisibleToChurch] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [priceReais, setPriceReais] = useState("");
  const [recurrence, setRecurrence] = useState<EventRecurrenceFormState>(
    defaultRecurrenceFormState(initialStartsAt),
  );
  const [fieldErrors, setFieldErrors] = useState<ActivityFormFieldErrors>({});
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const fieldIds = useMemo(() => activityFormFieldIds("activity"), []);

  function clearFieldError(field: ActivityFormField) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function setFormFieldErrors(errors: ActivityFormFieldErrors) {
    setFieldErrors(errors);

    if (errors.price) {
      setRegistrationOpen(true);
    }

    if (activityFormErrorsNeedMoreOptions(errors)) {
      setShowMoreOptions(true);
    }

    applyActivityFormFieldErrors(errors, fieldIds);
  }

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
        setMinistryId(initialMinistryId);
        setDescription("");
        setHighlightNote("");
        setLocation("");
        setStartsAt(fallbackStartsAt());
        setEndsAt(defaultEndsAt(fallbackStartsAt()));
        setVisibleToChurch(false);
        setRegistrationOpen(false);
        setPriceReais("");
        setRecurrence(defaultRecurrenceFormState(fallbackStartsAt()));
        setFieldErrors({});
        setShowMoreOptions(false);
      }

      wasOpenRef.current = false;
      return;
    }

    const nextStartsAt = defaultStartsAtValue ?? fallbackStartsAt();

    wasOpenRef.current = true;
    // Sem permissão church-wide, não deixa ministryId vazio (seria evento da igreja).
    setMinistryId(initialMinistryId);
    setVisibleToChurch(canSelectChurchWide);
    setStartsAt(nextStartsAt);
    setEndsAt(defaultEndsAt(nextStartsAt));
    setRecurrence(defaultRecurrenceFormState(nextStartsAt));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, initialMinistryId, defaultStartsAtValue, canSelectChurchWide]);

  useEffect(() => {
    if (!open || lockedMinistryId || canSelectChurchWide || ministryId) {
      return;
    }

    const firstMinistryId = creatableMinistries[0]?.id;
    if (firstMinistryId) {
      setMinistryId(firstMinistryId);
    }
  }, [
    open,
    lockedMinistryId,
    canSelectChurchWide,
    ministryId,
    creatableMinistries,
  ]);

  useEffect(() => {
    if (!canSelectChurchWide && visibleToChurch) {
      setVisibleToChurch(false);
    }
  }, [canSelectChurchWide, visibleToChurch]);

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
    setFieldErrors({});

    if (!name.trim()) {
      setFormFieldErrors({ name: "Informe o nome da atividade." });
      return;
    }

    if (
      !endsAt ||
      !isValidScheduleRange(
        startsAt,
        endsAt,
        isAllDayRange(startsAt, endsAt),
      )
    ) {
      setFormFieldErrors({
        root: "O fim precisa ser no mesmo dia ou depois do início.",
      });
      return;
    }

    if (!canSelectChurchWide && !ministryId && !lockedMinistryId) {
      setFormFieldErrors({
        ministryId: "Selecione um ministério para criar o evento.",
      });
      return;
    }

    const recurrencePayload = buildRecurrencePayload(recurrence);

    if (recurrence.endType === "on_date" && recurrence.repeatMode !== "none" && !recurrence.endDate) {
      setFormFieldErrors({
        recurrenceEndDate: "Informe a data final da repetição.",
      });
      return;
    }

    const priceCents = priceReais.trim()
      ? parseBrlMaskToCents(priceReais)
      : null;

    if (
      registrationOpen &&
      priceCents != null &&
      priceCents > 0 &&
      priceCents < 500
    ) {
      setFormFieldErrors({
        price:
          "O preço mínimo da inscrição paga é R$ 5,00 (ou deixe vazio para gratuita).",
      });
      return;
    }

    if (
      priceCents != null &&
      priceCents >= 500 &&
      !canChargePaidRegistration
    ) {
      setFormFieldErrors({
        price:
          "Ative os recebimentos da igreja antes de abrir inscrição paga.",
      });
      return;
    }

    const openRegistration =
      registrationOpen || Boolean(priceCents != null && priceCents >= 500);

    const resolvedMinistryId = lockedMinistryId || ministryId;

    const payload: CreateChurchEventPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      highlightNote: highlightNote.trim() || undefined,
      location: location.trim() || undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      ministryId: resolvedMinistryId || undefined,
      recurrence: recurrencePayload,
      // Escala fica implícita (padrão do backend). Coleta de disponibilidade
      // e montagem da equipe acontecem na página do evento após a criação.
      ...(resolvedMinistryId
        ? { visibleToChurch: canSelectChurchWide ? visibleToChurch : false }
        : {}),
      registrationOpen: openRegistration,
      priceCents:
        openRegistration && priceCents != null && priceCents >= 500
          ? priceCents
          : null,
    };

    try {
      await createEvent.mutateAsync(payload);
      onClose();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar a atividade.";
      setFormFieldErrors(mapActivityFormApiError(message));
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
              Novo evento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {lockedMinistryId ? (
                <>
                  Criar evento para{" "}
                  <span className="font-medium text-foreground">
                    {fixedMinistryName?.trim() || "este ministério"}
                  </span>
                </>
              ) : canSelectChurchWide ? (
                "Deixe sem ministério para destacar como evento da igreja inteira."
              ) : (
                "Escolha um ministério em que você pode criar eventos."
              )}
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="space-y-8 overflow-y-auto px-6 py-6">
            <EventFormSection
              title="Informações básicas"
              description={
                lockedMinistryId
                  ? "Nome e detalhes que a equipe verá na agenda do ministério."
                  : "Nome, ministério e detalhes que aparecem na agenda."
              }
              icon={FileText}
            >
              <div className="space-y-4">
                <FormField
                  label="Nome"
                  htmlFor={fieldIds.name}
                  error={fieldErrors.name}
                  required
                >
                  <Input
                    id={fieldIds.name}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      clearFieldError("name");
                    }}
                    placeholder="Ex.: Culto de domingo, Conferência, Ensaio"
                    disabled={createEvent.isPending}
                    autoFocus
                    aria-invalid={fieldErrors.name ? true : undefined}
                    className="h-11 rounded-xl"
                  />
                </FormField>

                {!lockedMinistryId ? (
                  <FormField
                    label="Ministério"
                    htmlFor={fieldIds.ministryId}
                    error={fieldErrors.ministryId}
                    hint={
                      canSelectChurchWide
                        ? "Eventos da igreja aparecem em destaque no painel."
                        : "Selecione um ministério em que você pode criar eventos."
                    }
                  >
                    <SelectField
                      id={fieldIds.ministryId}
                      value={ministryId}
                      onChange={(event) => {
                        setMinistryId(event.target.value);
                        clearFieldError("ministryId");
                      }}
                      disabled={createEvent.isPending}
                      aria-invalid={fieldErrors.ministryId ? true : undefined}
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
                  </FormField>
                ) : null}

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

            <div className="rounded-xl border border-border/80">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                aria-expanded={showMoreOptions}
                onClick={() => setShowMoreOptions((current) => !current)}
              >
                <span>Mais opções</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {showMoreOptions
                    ? "Ocultar"
                    : "Inscrição, repetição e destaque"}
                </span>
              </button>

              {showMoreOptions ? (
                <div className="space-y-8 border-t border-border/80 px-4 py-5">
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

                  <div className="space-y-3">
                    <EventOptionCard
                      type="checkbox"
                      checked={registrationOpen}
                      onChange={(checked) => {
                        setRegistrationOpen(checked);
                        clearFieldError("price");
                        if (!checked) {
                          setPriceReais("");
                        }
                      }}
                      title="Abrir inscrição"
                      description="Membros confirmam participação na página do evento. Pode ser gratuita ou paga."
                      icon={Ticket}
                      disabled={createEvent.isPending}
                      compact
                    />

                    {registrationOpen ? (
                      <FormField
                        label="Preço da inscrição (opcional)"
                        htmlFor={fieldIds.price}
                        error={fieldErrors.price}
                        hint={
                          canChargePaidRegistration
                            ? "Vazio = inscrição gratuita. Com valor, membros pagam pela conta de recebimentos da igreja (mínimo R$ 5,00)."
                            : undefined
                        }
                      >
                        <div className="relative pl-1">
                          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
                            R$
                          </span>
                          <Input
                            id={fieldIds.price}
                            inputMode="numeric"
                            autoComplete="off"
                            value={priceReais}
                            onChange={(event) => {
                              clearFieldError("price");
                              const digits = event.target.value.replace(
                                /\D/g,
                                "",
                              );
                              setPriceReais(
                                digits
                                  ? applyBrlCentsMask(event.target.value)
                                  : "",
                              );
                            }}
                            disabled={
                              createEvent.isPending ||
                              !canChargePaidRegistration
                            }
                            placeholder="0,00 — vazio = gratuita"
                            aria-invalid={fieldErrors.price ? true : undefined}
                            className="h-11 rounded-xl pl-10 tabular-nums"
                          />
                        </div>
                        {!fieldErrors.price &&
                        !canChargePaidRegistration &&
                        !connectPending ? (
                          <PaidRegistrationReceivablesHint
                            href={receivablesHref}
                          />
                        ) : null}
                      </FormField>
                    ) : null}
                  </div>

                  <EventFormSection
                    title="Repetição"
                    description="Opcional. Crie uma série de ocorrências com a mesma configuração."
                    icon={Repeat}
                  >
                    <EventRecurrenceFields
                      value={recurrence}
                      onChange={(next) => {
                        setRecurrence(next);
                        clearFieldError("recurrenceEndDate");
                      }}
                      startsAt={startsAt}
                      endsAt={endsAt}
                      disabled={createEvent.isPending}
                      idPrefix="activity"
                      endDateError={fieldErrors.recurrenceEndDate}
                    />
                  </EventFormSection>

                  {ministryId && canSelectChurchWide ? (
                    <EventFormSection
                      title="Quem pode ver"
                      description="Controle se o evento aparece na agenda geral da igreja."
                      icon={Eye}
                    >
                      <EventVisibilityFields
                        visibleToChurch={visibleToChurch}
                        onVisibleToChurchChange={setVisibleToChurch}
                        allowChurchWideVisibility={canSelectChurchWide}
                        disabled={createEvent.isPending}
                      />
                    </EventFormSection>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <Separator />

          <footer className="flex flex-col gap-3 px-6 py-4">
            {fieldErrors.root ? (
              <FormAlert className="sm:ml-auto sm:max-w-md">
                {fieldErrors.root}
              </FormAlert>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
