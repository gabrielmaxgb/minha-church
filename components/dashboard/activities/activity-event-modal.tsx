"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Repeat,
  Sparkles,
  Ticket,
  Trash2,
} from "lucide-react";

import { ActivityAvailabilitySection } from "@/components/dashboard/activities/activity-availability-section";
import { ActivityScheduleFields } from "@/components/dashboard/activities/activity-schedule-fields";
import { EventHighlightNote } from "@/components/dashboard/activities/event-highlight-note";
import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventMutationScopeDialog } from "@/components/dashboard/activities/event-mutation-scope-dialog";
import { EventOptionCard } from "@/components/dashboard/activities/event-option-card";
import { EventRecurrenceFields } from "@/components/dashboard/activities/event-recurrence-fields";
import { EventRegistrationOpenBadge } from "@/components/dashboard/activities/event-registration-open-badge";
import { EventVisibilityFields } from "@/components/dashboard/activities/event-visibility-fields";
import { LargeModalShell } from "@/components/dashboard/activities/large-modal-shell";
import { TrialExpiredWriteModal } from "@/components/dashboard/trial-expired-write-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { activityDetailPath, ministryDetailPath } from "@/constants/routes";
import {
  useChurchEvent,
  useDeleteChurchEvent,
  useUpdateChurchEvent,
} from "@/lib/api/queries";
import { toDatetimeLocalValue } from "@/lib/activities/datetime";
import { isEventRegistrationOpen } from "@/lib/events/registration";
import {
  buildRecurrencePayload,
  defaultRecurrenceFormState,
  formatRecurrenceSummary,
  recurrenceFormStateFromEvent,
  recurrenceFormStatesEqual,
  syncRecurrenceDaysWithStart,
  type EventRecurrenceFormState,
} from "@/lib/events/recurrence";
import {
  canManageActivity,
  canManageEventRoster,
} from "@/lib/permissions";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import {
  applyBrlCentsMask,
  cn,
  formatBrlCentsMask,
  formatDateTime,
  parseBrlMaskToCents,
} from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { EventMutationScope } from "@/types/events";

interface ActivityEventModalProps {
  eventId: string | null;
  open: boolean;
  onClose: () => void;
  initialMode?: "view" | "edit";
  onDeleted?: () => void;
}

export function ActivityEventModal({
  eventId,
  open,
  onClose,
  initialMode = "view",
  onDeleted,
}: ActivityEventModalProps) {
  const titleId = useId();
  const { user, permissions } = useAuth();
  const { writesBlocked, guardWrite, paywallAction, closePaywall } =
    useTrialWriteGuard();
  const { data: event, isLoading, isError } = useChurchEvent(eventId ?? "");

  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [highlightNote, setHighlightNote] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [visibleToChurch, setVisibleToChurch] = useState(true);
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
  const [scopeDialog, setScopeDialog] = useState<"edit" | "delete" | null>(null);

  const updateEvent = useUpdateChurchEvent(eventId ?? "");
  const deleteEvent = useDeleteChurchEvent(eventId ?? "");

  const isRecurring = Boolean(event?.recurrenceSeriesId && event?.recurrence);
  const recurrenceChanged = !recurrenceFormStatesEqual(
    recurrence,
    initialRecurrence,
  );
  const recurrenceRequiresSeriesScope = recurrenceChanged && isRecurring;
  const canManage =
    event && permissions
      ? canManageActivity(permissions, event, user?.id ?? null)
      : false;
  const canManageRoster =
    event && permissions
      ? canManageEventRoster(permissions, event, user?.id ?? null)
      : false;
  const showAvailabilityPanel = Boolean(
    event?.usesRoster &&
      event.rosterOpen &&
      !canManageRoster &&
      event.canRespondToAvailability,
  );
  const isPending = updateEvent.isPending || deleteEvent.isPending;

  const hasChanges = useMemo(() => {
    if (!event || mode !== "edit") {
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
      registrationOpen !== isEventRegistrationOpen(event) ||
      (priceReais.trim()
        ? parseBrlMaskToCents(priceReais)
        : null) !==
        (event.priceCents && event.priceCents > 0 ? event.priceCents : null) ||
      recurrenceChanged
    );
  }, [
    event,
    mode,
    name,
    description,
    highlightNote,
    location,
    startsAt,
    endsAt,
    visibleToChurch,
    registrationOpen,
    priceReais,
    recurrenceChanged,
  ]);

  useEffect(() => {
    if (!open) {
      setMode(initialMode);
      setConfirmDelete(false);
      setScopeDialog(null);
      setError(null);
      return;
    }

    setMode(initialMode);
  }, [open, initialMode, eventId]);

  useEffect(() => {
    if (!event || mode !== "edit") {
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
    setRegistrationOpen(isEventRegistrationOpen(event));
    setPriceReais(
      event.priceCents && event.priceCents > 0
        ? formatBrlCentsMask(event.priceCents)
        : "",
    );
    setRecurrence(nextRecurrence);
    setInitialRecurrence(nextRecurrence);
    setError(null);
    setConfirmDelete(false);
  }, [event, mode]);

  async function performSave(scope?: EventMutationScope) {
    if (!event) {
      return;
    }

    if (
      recurrence.endType === "on_date" &&
      recurrence.repeatMode !== "none" &&
      !recurrence.endDate
    ) {
      setError("Informe a data final da repetição.");
      setScopeDialog(null);
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
      setError(
        "O preço mínimo da inscrição paga é R$ 5,00 (ou deixe vazio para gratuita).",
      );
      setScopeDialog(null);
      return;
    }

    const openRegistration =
      registrationOpen || Boolean(priceCents != null && priceCents >= 500);

    const recurrencePayload = recurrenceChanged
      ? recurrence.repeatMode === "none"
        ? null
        : buildRecurrencePayload(recurrence)
      : undefined;

    const resolvedScope = recurrenceRequiresSeriesScope
      ? scope === "this" || !scope
        ? "this_and_following"
        : scope
      : scope;

    try {
      await updateEvent.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        highlightNote: highlightNote.trim() || null,
        location: location.trim() || null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        visibleToChurch: event.ministryId ? visibleToChurch : undefined,
        registrationOpen: openRegistration,
        priceCents:
          openRegistration && priceCents != null && priceCents >= 500
            ? priceCents
            : null,
        ...(recurrencePayload !== undefined
          ? { recurrence: recurrencePayload }
          : {}),
        ...(isRecurring && resolvedScope ? { scope: resolvedScope } : {}),
      });
      setScopeDialog(null);
      if (initialMode === "edit") {
        onClose();
      } else {
        setMode("view");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar a atividade.",
      );
      setScopeDialog(null);
    }
  }

  async function performDelete(scope?: EventMutationScope) {
    try {
      await deleteEvent.mutateAsync(isRecurring ? scope : "this");
      setScopeDialog(null);
      onClose();
      onDeleted?.();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir a atividade.",
      );
      setScopeDialog(null);
    }
  }

  function handleSaveClick() {
    setError(null);

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

    if (isRecurring) {
      setScopeDialog("edit");
      return;
    }

    void performSave();
  }

  function handleDeleteClick() {
    if (isRecurring) {
      setScopeDialog("delete");
      return;
    }

    void performDelete("this");
  }

  if (!open || !eventId) {
    return null;
  }

  if (writesBlocked && initialMode === "edit") {
    return (
      <TrialExpiredWriteModal
        open
        onClose={onClose}
        action="editar atividades"
      />
    );
  }

  const shellTitle =
    mode === "edit"
      ? "Editar atividade"
      : event?.name ?? "Atividade";

  const shellSubtitle =
    event && mode === "view"
      ? formatDateTime(event.startsAt)
      : event && mode === "edit"
        ? `Alterações em ${event.name}`
        : isLoading
          ? "Carregando..."
          : undefined;

  return (
    <>
      <LargeModalShell
        open={open}
        onClose={onClose}
        disabled={isPending}
        title={shellTitle}
        subtitle={shellSubtitle}
        icon={Calendar}
        titleId={titleId}
        footer={
          mode === "view" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" size="sm" asChild>
                <Link href={activityDetailPath(eventId)}>
                  <ExternalLink className="size-4" />
                  Abrir página do evento
                </Link>
              </Button>
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                {canManage ? (
                  <Button
                    type="button"
                    onClick={() =>
                      guardWrite("editar atividades", () => setMode("edit"))
                    }
                  >
                    <Pencil className="size-4" />
                    Editar
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setConfirmDelete(false);
                  setError(null);
                  if (initialMode === "edit") {
                    onClose();
                    return;
                  }
                  setMode("view");
                }}
              >
                Cancelar edição
              </Button>
              <Button
                type="button"
                disabled={isPending || !name.trim() || !hasChanges}
                onClick={handleSaveClick}
              >
                {updateEvent.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Salvar alterações
              </Button>
            </div>
          )
        }
      >
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : isError || !event ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar esta atividade.
          </p>
        ) : mode === "view" ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {event.isChurchWide ? (
                <Badge className="gap-1.5">
                  <Sparkles className="size-3" />
                  Igreja
                </Badge>
              ) : event.ministryName && event.ministryId ? (
                <Link href={ministryDetailPath(event.ministryId)}>
                  <Badge variant="secondary">{event.ministryName}</Badge>
                </Link>
              ) : null}
              {event.recurrence ? (
                <Badge variant="secondary" className="gap-1.5">
                  <Repeat className="size-3" />
                  Recorrente
                </Badge>
              ) : null}
              {event.usesRoster ? (
                <Badge variant="outline">
                  {event.rosterOpen ? "Coleta aberta" : "Coleta fechada"}
                </Badge>
              ) : null}
              <EventRegistrationOpenBadge event={event} showPrice />
            </div>

            {event.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            ) : null}

            {showAvailabilityPanel ? (
              <ActivityAvailabilitySection
                event={event}
                interactionsDisabled={writesBlocked}
              />
            ) : null}

            {event.usesRoster && canManageRoster ? (
              <p className="text-sm text-muted-foreground">
                Escala e equipe são gerenciadas na{" "}
                <Link
                  href={activityDetailPath(eventId)}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  página do evento
                </Link>
                .
              </p>
            ) : null}

            {event.highlightNote ? (
              <EventHighlightNote note={event.highlightNote} />
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile
                icon={Calendar}
                label="Data e hora"
                value={formatDateTime(event.startsAt)}
              />
              {event.endsAt ? (
                <InfoTile
                  icon={Clock}
                  label="Término"
                  value={formatDateTime(event.endsAt)}
                />
              ) : null}
              {event.location ? (
                <InfoTile
                  icon={MapPin}
                  label="Local"
                  value={event.location}
                  className="sm:col-span-2"
                />
              ) : null}
              {event.recurrence ? (
                <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3.5 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Repetição
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {formatRecurrenceSummary(event.recurrence, event.startsAt)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            <EventFormSection
              title="Informações principais"
              description="Nome, descrição e local."
              icon={FileText}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-modal-name">Nome</Label>
                  <Input
                    id="event-modal-name"
                    value={name}
                    onChange={(inputEvent) => setName(inputEvent.target.value)}
                    disabled={isPending}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-modal-description">
                    Descrição do evento
                  </Label>
                  <Textarea
                    id="event-modal-description"
                    value={description}
                    onChange={(inputEvent) =>
                      setDescription(inputEvent.target.value)
                    }
                    rows={3}
                    disabled={isPending}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-modal-highlight-note">
                    Recado em destaque
                  </Label>
                  <Textarea
                    id="event-modal-highlight-note"
                    value={highlightNote}
                    onChange={(inputEvent) =>
                      setHighlightNote(inputEvent.target.value)
                    }
                    rows={3}
                    disabled={isPending}
                    className="rounded-xl"
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
                    <div className="space-y-2 pl-1">
                      <Label htmlFor="event-modal-price">
                        Preço da inscrição (opcional)
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                          R$
                        </span>
                        <Input
                          id="event-modal-price"
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
                          disabled={isPending}
                          placeholder="0,00 — vazio = gratuita"
                          className="h-11 rounded-xl pl-10 tabular-nums"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vazio = inscrição gratuita. Com valor, pagamento via
                        Stripe Connect (mínimo R$ 5,00).
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-modal-location">Local</Label>
                  <Input
                    id="event-modal-location"
                    value={location}
                    onChange={(inputEvent) =>
                      setLocation(inputEvent.target.value)
                    }
                    disabled={isPending}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </EventFormSection>

            <EventFormSection
              title="Data e horário"
              description="Quando esta ocorrência acontece."
              icon={Clock}
            >
              <ActivityScheduleFields
                idPrefix="event-modal"
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
              description="Trate a série como um único evento — altere a regra quando precisar."
              icon={Repeat}
            >
              <EventRecurrenceFields
                value={recurrence}
                onChange={setRecurrence}
                startsAt={startsAt}
                disabled={isPending}
              />
            </EventFormSection>

            {event.ministryId ? (
              <EventFormSection
                title="Quem pode ver"
                description="Visibilidade na agenda da igreja."
                icon={Eye}
              >
                <EventVisibilityFields
                  visibleToChurch={visibleToChurch}
                  onVisibleToChurchChange={setVisibleToChurch}
                  disabled={isPending}
                />
              </EventFormSection>
            ) : null}

            <EventFormSection
              title="Zona de perigo"
              description="Excluir remove da agenda."
              className="border-t border-border/80 pt-2"
              contentClassName="border-destructive/15 bg-destructive/3"
            >
              {confirmDelete ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tem certeza que deseja excluir esta atividade?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isPending}
                      onClick={handleDeleteClick}
                    >
                      {deleteEvent.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Confirmar exclusão
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isPending}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" />
                  Excluir atividade
                </Button>
              )}
            </EventFormSection>
          </div>
        )}
      </LargeModalShell>

      <EventMutationScopeDialog
        open={scopeDialog !== null}
        action={scopeDialog === "delete" ? "delete" : "edit"}
        busy={isPending}
        hideThisOption={
          scopeDialog === "edit" && recurrenceRequiresSeriesScope
        }
        onCancel={() => setScopeDialog(null)}
        onConfirm={(scope) => {
          if (scopeDialog === "delete") {
            void performDelete(scope);
            return;
          }

          void performSave(scope);
        }}
      />

      <TrialExpiredWriteModal
        open={paywallAction !== null}
        onClose={closePaywall}
        action={paywallAction ?? undefined}
      />
    </>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-3.5",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium capitalize text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
