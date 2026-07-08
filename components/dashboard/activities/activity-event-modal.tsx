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
  Trash2,
} from "lucide-react";

import { ActivityAvailabilitySection } from "@/components/dashboard/activities/activity-availability-section";
import { ActivityScheduleFields } from "@/components/dashboard/activities/activity-schedule-fields";
import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventMutationScopeDialog } from "@/components/dashboard/activities/event-mutation-scope-dialog";
import { EventVisibilityFields } from "@/components/dashboard/activities/event-visibility-fields";
import { LargeModalShell } from "@/components/dashboard/activities/large-modal-shell";
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
import { formatRecurrenceSummary } from "@/lib/events/recurrence";
import {
  canManageActivity,
  canManageEventRoster,
} from "@/lib/permissions";
import { cn, formatDateTime } from "@/lib/utils";
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
  const { data: event, isLoading, isError } = useChurchEvent(eventId ?? "");

  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [visibleToChurch, setVisibleToChurch] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [scopeDialog, setScopeDialog] = useState<"edit" | "delete" | null>(null);

  const updateEvent = useUpdateChurchEvent(eventId ?? "");
  const deleteEvent = useDeleteChurchEvent(eventId ?? "");

  const isRecurring = Boolean(event?.recurrenceSeriesId && event?.recurrence);
  const canManage =
    event && permissions
      ? canManageActivity(permissions, event, user?.id ?? null)
      : false;
  const canManageRoster =
    event && permissions
      ? canManageEventRoster(permissions, event, user?.id ?? null)
      : false;
  const showAvailabilityPanel = Boolean(
    event?.usesRoster && event.rosterOpen && !canManageRoster,
  );
  const isPending = updateEvent.isPending || deleteEvent.isPending;

  const hasChanges = useMemo(() => {
    if (!event || mode !== "edit") {
      return false;
    }

    return (
      name.trim() !== event.name ||
      (description.trim() || "") !== (event.description ?? "") ||
      (location.trim() || "") !== (event.location ?? "") ||
      startsAt !== toDatetimeLocalValue(event.startsAt) ||
      (endsAt || "") !==
        (event.endsAt ? toDatetimeLocalValue(event.endsAt) : "") ||
      visibleToChurch !== (event.visibleToChurch ?? true)
    );
  }, [
    event,
    mode,
    name,
    description,
    location,
    startsAt,
    endsAt,
    visibleToChurch,
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

    setName(event.name);
    setDescription(event.description ?? "");
    setLocation(event.location ?? "");
    setStartsAt(toDatetimeLocalValue(event.startsAt));
    setEndsAt(event.endsAt ? toDatetimeLocalValue(event.endsAt) : "");
    setVisibleToChurch(event.visibleToChurch ?? true);
    setError(null);
    setConfirmDelete(false);
  }, [event, mode]);

  async function performSave(scope?: EventMutationScope) {
    if (!event) {
      return;
    }

    try {
      await updateEvent.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        visibleToChurch: event.ministryId ? visibleToChurch : undefined,
        ...(isRecurring && scope ? { scope } : {}),
      });
      setScopeDialog(null);
      setMode("view");
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
                  <Button type="button" onClick={() => setMode("edit")}>
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
                  setMode("view");
                  setConfirmDelete(false);
                  setError(null);
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
            </div>

            {event.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
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

            {showAvailabilityPanel ? (
              <ActivityAvailabilitySection event={event} />
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
                  <Label htmlFor="event-modal-description">Descrição</Label>
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
                onStartsAtChange={setStartsAt}
                onEndsAtChange={setEndsAt}
                disabled={isPending}
                elevated
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
        onCancel={() => setScopeDialog(null)}
        onConfirm={(scope) => {
          if (scopeDialog === "delete") {
            void performDelete(scope);
            return;
          }

          void performSave(scope);
        }}
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
