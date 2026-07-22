"use client";

import { useState } from "react";
import {
  CalendarClock,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { parseDateKey, toDateKey } from "@/lib/events/calendar";
import {
  resolvePastoralNotesError,
  useCreatePastoralNote,
  useDeletePastoralNote,
  useMemberPastoralNotes,
  useUpdatePastoralNote,
} from "@/lib/api/queries";
import { toastError } from "@/lib/ui/toast";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  PASTORAL_NOTE_TYPE_LABELS,
  type PastoralNote,
  type PastoralNoteType,
} from "@/types/pastoral-notes";

const NOTE_TYPES = Object.keys(
  PASTORAL_NOTE_TYPE_LABELS,
) as PastoralNoteType[];

const FOLLOW_UP_PRESETS = [
  { days: 7, label: "Daqui a 1 semana" },
  { days: 14, label: "Daqui a 2 semanas" },
  { days: 30, label: "Daqui a 1 mês" },
] as const;

type NoteFormState = {
  type: PastoralNoteType;
  body: string;
  occurredOn: string;
  scheduleFollowUp: boolean;
  followUpOn: string;
};

function todayIsoDate(): string {
  return toDateKey(new Date());
}

function addDaysIso(iso: string, days: number): string {
  const base = parseDateKey(iso) ?? new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return toDateKey(next);
}

function emptyForm(): NoteFormState {
  return {
    type: "conversation",
    body: "",
    occurredOn: todayIsoDate(),
    scheduleFollowUp: false,
    followUpOn: todayIsoDate(),
  };
}

function noteToForm(note: PastoralNote): NoteFormState {
  return {
    type: note.type,
    body: note.body,
    occurredOn: note.occurredOn,
    scheduleFollowUp: Boolean(note.followUpOn),
    followUpOn: note.followUpOn ?? todayIsoDate(),
  };
}

function TypeBadge({ type }: { type: PastoralNoteType }) {
  return (
    <span className="inline-flex rounded-md border border-domain-members/25 bg-domain-members-subtle px-2 py-0.5 text-[11px] font-medium text-domain-members-foreground">
      {PASTORAL_NOTE_TYPE_LABELS[type]}
    </span>
  );
}

function NoteFormFields({
  form,
  onChange,
  disabled,
}: {
  form: NoteFormState;
  onChange: (next: NoteFormState) => void;
  disabled?: boolean;
}) {
  const followUpPresetDays = form.scheduleFollowUp
    ? FOLLOW_UP_PRESETS.find(
        (preset) =>
          form.followUpOn === addDaysIso(form.occurredOn, preset.days),
      )?.days
    : null;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Como foi o contato?
        </p>
        <div
          role="group"
          aria-label="Como foi o contato"
          className="flex flex-wrap gap-1.5"
        >
          {NOTE_TYPES.map((type) => {
            const selected = form.type === type;
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onChange({ ...form, type })}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors",
                  selected
                    ? "border-foreground bg-foreground font-medium text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                {PASTORAL_NOTE_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          O que você quer lembrar depois?
        </p>
        <Textarea
          id="pastoral-note-body"
          value={form.body}
          disabled={disabled}
          rows={5}
          maxLength={4000}
          autoFocus
          aria-label="O que você quer lembrar depois"
          placeholder="Escreva com suas palavras — como a pessoa está, o que conversaram, se pediu oração ou ajuda…"
          className="min-h-32 resize-y text-base leading-relaxed sm:text-sm"
          onChange={(event) =>
            onChange({ ...form, body: event.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Isso aconteceu quando?
          </p>
          <DatePicker
            id="pastoral-note-occurred"
            value={form.occurredOn}
            disabled={disabled}
            onChange={(occurredOn) => {
              const nextFollowUp =
                form.scheduleFollowUp && followUpPresetDays
                  ? addDaysIso(occurredOn, followUpPresetDays)
                  : form.followUpOn;
              onChange({
                ...form,
                occurredOn,
                followUpOn: nextFollowUp,
              });
            }}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2 sm:max-w-lg">
          <div>
            <p className="text-sm font-medium text-foreground">
              Quer lembrar de voltar a falar?
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              A gente avisa no quadro de acompanhamento na data que você
              escolher.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={disabled}
              aria-pressed={!form.scheduleFollowUp}
              onClick={() =>
                onChange({ ...form, scheduleFollowUp: false })
              }
              className={cn(
                "inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors",
                !form.scheduleFollowUp
                  ? "border-foreground bg-foreground font-medium text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              Por enquanto, não
            </button>

            {FOLLOW_UP_PRESETS.map((preset) => {
              const selected =
                form.scheduleFollowUp && followUpPresetDays === preset.days;
              return (
                <button
                  key={preset.days}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({
                      ...form,
                      scheduleFollowUp: true,
                      followUpOn: addDaysIso(form.occurredOn, preset.days),
                    })
                  }
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors",
                    selected
                      ? "border-foreground bg-foreground font-medium text-background"
                      : "border-border text-muted-foreground hover:text-foreground",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {form.scheduleFollowUp ? (
            <div className="space-y-1.5 pt-1">
              <p className="text-sm text-muted-foreground">
                Ou escolha outra data:
              </p>
              <div className="max-w-48">
                <DatePicker
                  id="pastoral-note-follow-up"
                  value={form.followUpOn}
                  disabled={disabled}
                  onChange={(followUpOn) =>
                    onChange({
                      ...form,
                      scheduleFollowUp: true,
                      followUpOn,
                    })
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MemberPastoralCarePanel({ memberId }: { memberId: string }) {
  const { user } = useAuth();
  const notesQuery = useMemberPastoralNotes(memberId, { page: 1, limit: 30 });
  const createMutation = useCreatePastoralNote();
  const updateMutation = useUpdatePastoralNote();
  const deleteMutation = useDeletePastoralNote();

  const [composerOpen, setComposerOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PastoralNote | null>(null);
  const [form, setForm] = useState<NoteFormState>(emptyForm);
  const [noteToDelete, setNoteToDelete] = useState<PastoralNote | null>(null);

  const notes = notesQuery.data?.items ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditingNote(null);
    setForm(emptyForm());
    setComposerOpen(true);
  };

  const openEdit = (note: PastoralNote) => {
    setEditingNote(note);
    setForm(noteToForm(note));
    setComposerOpen(true);
  };

  const closeComposer = () => {
    if (isSaving) return;
    setComposerOpen(false);
    setEditingNote(null);
  };

  const submit = async () => {
    const body = form.body.trim();
    if (!body) {
      toastError("Escreva um pouquinho sobre o contato — isso ajuda depois.");
      return;
    }
    if (!form.occurredOn) {
      toastError("Escolha o dia em que isso aconteceu.");
      return;
    }
    if (form.scheduleFollowUp && !form.followUpOn) {
      toastError("Escolha o dia em que você quer lembrar de voltar.");
      return;
    }
    if (
      form.scheduleFollowUp &&
      form.followUpOn &&
      form.followUpOn < form.occurredOn
    ) {
      toastError("O lembrete precisa ser no mesmo dia do contato ou depois.");
      return;
    }

    const followUpOn = form.scheduleFollowUp ? form.followUpOn : null;

    try {
      if (editingNote) {
        await updateMutation.mutateAsync({
          noteId: editingNote.id,
          payload: {
            type: form.type,
            body,
            occurredOn: form.occurredOn,
            followUpOn,
          },
        });
      } else {
        await createMutation.mutateAsync({
          memberId,
          type: form.type,
          body,
          occurredOn: form.occurredOn,
          followUpOn,
        });
      }
      setComposerOpen(false);
      setEditingNote(null);
      setForm(emptyForm());
    } catch (error) {
      toastError(resolvePastoralNotesError(error));
    }
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      await deleteMutation.mutateAsync(noteToDelete.id);
      setNoteToDelete(null);
      if (editingNote?.id === noteToDelete.id) {
        closeComposer();
      }
    } catch (error) {
      toastError(resolvePastoralNotesError(error));
      setNoteToDelete(null);
    }
  };

  if (notesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (notesQuery.isError) {
    return (
      <FormAlert>
        {resolvePastoralNotesError(
          notesQuery.error,
          "Não foi possível carregar o acompanhamento.",
        )}
      </FormAlert>
    );
  }

  return (
    <div className="space-y-5">
      {!composerOpen ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Guarde aqui o que importa de cada conversa — só quem cuida desta
            área consegue ver.
          </p>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            Anotar um contato
          </Button>
        </div>
      ) : null}

      {composerOpen ? (
        <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {editingNote ? "Ajustar anotação" : "Anotar um contato"}
              </h3>
              {!editingNote ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Não precisa ser formal — escreva como você lembra.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={closeComposer}
              className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Deixar pra depois
            </button>
          </div>

          <NoteFormFields
            form={form}
            onChange={setForm}
            disabled={isSaving}
          />

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              disabled={isSaving || !form.body.trim()}
              onClick={() => void submit()}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              {editingNote ? "Salvar alterações" : "Guardar anotação"}
            </Button>
          </div>
        </div>
      ) : null}

      {notes.length === 0 && !composerOpen ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 px-5 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            Ainda não tem nenhum registro
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Depois de uma visita ou conversa, anote aqui — fica mais fácil
            lembrar e acompanhar.
          </p>
          <Button type="button" className="mt-5" size="sm" onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            Anotar o primeiro contato
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => {
            const canEdit =
              Boolean(user?.isOwner) || note.authorUserId === user?.id;

            return (
              <li
                key={note.id}
                className="rounded-2xl border border-border/80 bg-background px-4 py-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={note.type} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.occurredOn)}
                    </span>
                    {note.followUpOn ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" aria-hidden />
                        Lembrar em {formatDate(note.followUpOn)}
                      </span>
                    ) : null}
                  </div>

                  {canEdit ? (
                    <div className="flex items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="Alterar esta anotação"
                        onClick={() => openEdit(note)}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        aria-label="Apagar esta anotação"
                        onClick={() => setNoteToDelete(note)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {note.body}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Por {note.authorName}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {noteToDelete ? (
        <FinanceConfirmDialog
          title="Apagar esta anotação?"
          description="Ela some do acompanhamento e não dá para desfazer. Tem certeza?"
          confirmLabel="Sim, apagar"
          confirmingLabel="Apagando…"
          tone="destructive"
          isPending={deleteMutation.isPending}
          onCancel={() => setNoteToDelete(null)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </div>
  );
}
