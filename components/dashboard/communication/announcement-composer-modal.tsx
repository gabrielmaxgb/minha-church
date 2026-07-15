"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Info, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { TypeaheadMultiSelect } from "@/components/ui/typeahead-multi-select";
import {
  useCreateAnnouncement,
  useMinistries,
  useUpdateAnnouncement,
} from "@/lib/api/queries";
import { canListMinistries, canManageCommunication } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import type {
  Announcement,
  AnnouncementAudienceType,
  AnnouncementPriority,
  CreateAnnouncementPayload,
} from "@/types/announcements";

interface AnnouncementComposerModalProps {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 10);
}

function startOfDayIso(dateKey: string): string {
  return new Date(`${dateKey}T08:00:00`).toISOString();
}

function endOfDayIso(dateKey: string): string {
  return new Date(`${dateKey}T23:59:00`).toISOString();
}

interface ComposerFormState {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audienceType: AnnouncementAudienceType;
  ministryIds: string[];
  pinned: boolean;
  scheduleEnabled: boolean;
  scheduleDate: string;
  expiryEnabled: boolean;
  expiryDate: string;
}

function validateComposerForm(
  form: ComposerFormState,
  options?: { ministriesLoading?: boolean },
): string | null {
  const trimmedTitle = form.title.trim();
  const trimmedBody = form.body.trim();

  if (trimmedTitle.length < 2) {
    return "Informe um título com pelo menos 2 caracteres.";
  }

  if (trimmedBody.length < 1) {
    return "Escreva a mensagem do comunicado.";
  }

  if (form.audienceType === "ministries") {
    if (options?.ministriesLoading) {
      return "Aguarde o carregamento dos ministérios.";
    }

    if (form.ministryIds.length === 0) {
      return "Selecione ao menos um ministério para o público.";
    }
  }

  if (form.scheduleEnabled && !form.scheduleDate) {
    return "Escolha a data de publicação agendada.";
  }

  if (form.expiryEnabled && !form.expiryDate) {
    return "Escolha a data de expiração.";
  }

  const publishedAt = form.scheduleEnabled
    ? startOfDayIso(form.scheduleDate)
    : null;
  const expiresAt = form.expiryEnabled ? endOfDayIso(form.expiryDate) : null;
  const publishAt = publishedAt ? new Date(publishedAt) : new Date();

  if (expiresAt && new Date(expiresAt) <= publishAt) {
    return "A expiração deve ser depois da publicação.";
  }

  return null;
}

export function AnnouncementComposerModal({
  open,
  announcement,
  onClose,
}: AnnouncementComposerModalProps) {
  const titleId = useId();
  const isEditing = Boolean(announcement);
  const { permissions, user } = useAuth();
  const canList = canListMinistries(permissions);
  const canManage = canManageCommunication(permissions, user?.isOwner);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: ministries, isLoading: ministriesLoading } = useMinistries({
    enabled: open && (canList || canManage),
  });
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement(announcement?.id ?? "");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("normal");
  const [audienceType, setAudienceType] =
    useState<AnnouncementAudienceType>("church_wide");
  const [ministryIds, setMinistryIds] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (announcement) {
      setTitle(announcement.title);
      setBody(announcement.body);
      setPriority(announcement.priority);
      setAudienceType(announcement.audienceType);
      setMinistryIds(announcement.ministries.map((ministry) => ministry.id));
      setPinned(announcement.pinned);
      const isScheduled = announcement.status === "scheduled";
      setScheduleEnabled(isScheduled);
      setScheduleDate(isScheduled ? toDateInputValue(announcement.publishedAt) : "");
      setExpiryEnabled(Boolean(announcement.expiresAt));
      setExpiryDate(toDateInputValue(announcement.expiresAt));
    } else {
      setTitle("");
      setBody("");
      setPriority("normal");
      setAudienceType("church_wide");
      setMinistryIds([]);
      setPinned(false);
      setScheduleEnabled(false);
      setScheduleDate("");
      setExpiryEnabled(false);
      setExpiryDate("");
    }
  }, [open, announcement]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isPending, onClose]);

  const ministryOptions = useMemo(
    () =>
      (ministries ?? [])
        .filter((ministry) => ministry.isActive)
        .map((ministry) => ({ value: ministry.id, label: ministry.name })),
    [ministries],
  );

  const formState = useMemo<ComposerFormState>(
    () => ({
      title,
      body,
      priority,
      audienceType,
      ministryIds,
      pinned,
      scheduleEnabled,
      scheduleDate,
      expiryEnabled,
      expiryDate,
    }),
    [
      audienceType,
      body,
      expiryDate,
      expiryEnabled,
      ministryIds,
      pinned,
      priority,
      scheduleDate,
      scheduleEnabled,
      title,
    ],
  );

  const submitDisabled =
    isPending ||
    ministriesLoading ||
    (audienceType === "ministries" && ministryOptions.length === 0);

  const showSubmitError = useCallback((message: string) => {
    setError(message);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const validationError = validateComposerForm(formState, {
        ministriesLoading,
      });

      if (validationError) {
        showSubmitError(validationError);
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedBody = body.trim();
      const publishedAt = scheduleEnabled ? startOfDayIso(scheduleDate) : null;
      const expiresAt = expiryEnabled ? endOfDayIso(expiryDate) : null;

      const payload: CreateAnnouncementPayload = {
        title: trimmedTitle,
        body: trimmedBody,
        priority,
        audienceType,
        ministryIds: audienceType === "ministries" ? ministryIds : [],
        pinned,
        expiresAt,
      };

      try {
        if (isEditing && announcement) {
          await updateMutation.mutateAsync({
            ...payload,
            publishedAt: scheduleEnabled
              ? publishedAt
              : announcement.status === "scheduled"
                ? new Date().toISOString()
                : undefined,
          });
        } else {
          await createMutation.mutateAsync({
            ...payload,
            publishedAt: publishedAt ?? undefined,
          });
        }

        onClose();
      } catch (submitError) {
        showSubmitError(
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível salvar o comunicado.",
        );
      }
    },
    [
      announcement,
      audienceType,
      body,
      createMutation,
      expiryDate,
      expiryEnabled,
      formState,
      isEditing,
      ministriesLoading,
      ministryIds,
      onClose,
      pinned,
      priority,
      scheduleDate,
      scheduleEnabled,
      showSubmitError,
      title,
      updateMutation,
    ],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        onClick={() => !isPending && onClose()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-xl border border-border bg-background shadow-popover sm:max-h-[min(92dvh,720px)] sm:rounded-xl"
      >
        <header className="flex items-center justify-between border-b border-border/70 px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {isEditing ? "Editar aviso" : "Novo aviso"}
          </h2>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="announcement-title">Título</Label>
              <Input
                id="announcement-title"
                value={title}
                maxLength={160}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex.: Reunião de líderes neste sábado"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="announcement-body">Mensagem</Label>
              <Textarea
                id="announcement-body"
                value={body}
                maxLength={5000}
                rows={5}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Escreva o recado com os detalhes importantes."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="announcement-priority">Prioridade</Label>
                <SelectField
                  id="announcement-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as AnnouncementPriority)
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="important">Importante</option>
                  <option value="urgent">Urgente</option>
                </SelectField>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="announcement-audience">Público</Label>
                <SelectField
                  id="announcement-audience"
                  value={audienceType}
                  onChange={(event) =>
                    setAudienceType(
                      event.target.value as AnnouncementAudienceType,
                    )
                  }
                >
                  <option value="church_wide">Igreja inteira</option>
                  <option value="ministries">Ministérios específicos</option>
                </SelectField>
              </div>
            </div>

            {audienceType === "ministries" && (
              <div className="space-y-1.5">
                <Label>Ministérios</Label>
                <TypeaheadMultiSelect
                  value={ministryIds}
                  onChange={setMinistryIds}
                  options={ministryOptions}
                  loading={ministriesLoading}
                  placeholder="Buscar ministérios..."
                  emptyMessage={
                    canList || canManage
                      ? "Nenhum ministério ativo encontrado."
                      : "Você não tem permissão para listar ministérios."
                  }
                  aria-invalid={Boolean(error) && ministryIds.length === 0}
                />
                <p className="text-xs text-muted-foreground">
                  Só verão o comunicado os membros vinculados a esses
                  ministérios.
                </p>
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/70 px-3 py-2.5">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              <span className="text-sm">
                Fixar no topo do mural
                <span className="ml-1 text-muted-foreground">
                  (aparece antes dos demais)
                </span>
              </span>
            </label>

            <div className="space-y-2 rounded-xl border border-border/70 p-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    setScheduleEnabled(enabled);
                    if (!enabled) {
                      setScheduleDate("");
                    }
                  }}
                  className="size-4 rounded border-input accent-primary"
                />
                <span className="text-sm">Agendar publicação</span>
              </label>
              {scheduleEnabled && (
                <DatePicker
                  value={scheduleDate}
                  onChange={setScheduleDate}
                  className="max-w-[220px]"
                />
              )}

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={expiryEnabled}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    setExpiryEnabled(enabled);
                    if (!enabled) {
                      setExpiryDate("");
                    }
                  }}
                  className="size-4 rounded border-input accent-primary"
                />
                <span className="text-sm">Definir expiração</span>
              </label>
              {expiryEnabled && (
                <DatePicker
                  value={expiryDate}
                  onChange={setExpiryDate}
                  className="max-w-[220px]"
                />
              )}
              {!expiryEnabled && (
                <p className="flex gap-2 rounded-lg border border-attention-border bg-attention-subtle px-3 py-2.5 text-xs leading-relaxed text-attention-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-attention-foreground" aria-hidden />
                  <span>
                    Sem data de expiração, o comunicado permanece no mural até você
                    removê-lo manualmente.
                  </span>
                </p>
              )}
            </div>
          </div>

          <footer className="space-y-3 border-t border-border/70 px-6 py-4">
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitDisabled}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Publicar aviso"}
            </Button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
