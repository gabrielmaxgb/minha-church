"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Check,
  Lock,
  Loader2,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EventNoteEditor,
  EventNoteHtml,
} from "@/components/dashboard/activities/event-note-editor";
import {
  useCreateEventNote,
  useDeleteEventNote,
  useEventNotes,
  useUpdateEventNote,
} from "@/lib/api/queries/use-event-notes";
import {
  emptyEventNoteHtml,
  isEventNoteBodyEmpty,
} from "@/lib/events/event-note-html";
import { cn } from "@/lib/utils";
import { toastApiError, toastSuccess } from "@/lib/ui/toast";
import type { EventNote, EventNoteVisibility } from "@/types/events";

type EventNotesPanelProps = {
  eventId: string;
  interactionsDisabled?: boolean;
};

type ComposerPhase = "setup" | "writing";
type SaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_MS = 700;

function formatNoteWhen(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function EventNotesPanel({
  eventId,
  interactionsDisabled = false,
}: EventNotesPanelProps) {
  const reduceMotion = useReducedMotion();
  const { data, isPending, isError, error } = useEventNotes(eventId);
  const createNote = useCreateEventNote(eventId);
  const updateNote = useUpdateEventNote(eventId);
  const deleteNote = useDeleteEventNote(eventId);

  const [composerOpen, setComposerOpen] = useState(false);
  const [phase, setPhase] = useState<ComposerPhase>("setup");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<EventNoteVisibility>("public");
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const bodyRef = useRef(body);
  const activeNoteIdRef = useRef(activeNoteId);
  const phaseRef = useRef(phase);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedBodyRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  const pendingRetryRef = useRef(false);
  const updateNoteAsyncRef = useRef(updateNote.mutateAsync);
  const toastedSaveErrorRef = useRef(false);

  bodyRef.current = body;
  activeNoteIdRef.current = activeNoteId;
  phaseRef.current = phase;
  updateNoteAsyncRef.current = updateNote.mutateAsync;

  const notes = data?.notes ?? [];
  const canCreate = Boolean(data?.canCreate) && !interactionsDisabled;
  const roleOptions = data?.roleOptions ?? [];
  const isBusy = createNote.isPending || deleteNote.isPending;

  const clearSaveTimer = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const scheduleSave = useCallback(() => {
    clearSaveTimer();
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void flushSaveRef.current();
    }, AUTOSAVE_MS);
  }, [clearSaveTimer]);

  const flushSaveRef = useRef<() => Promise<void>>(async () => {});

  flushSaveRef.current = async () => {
    const noteId = activeNoteIdRef.current;
    if (!noteId || phaseRef.current !== "writing") {
      return;
    }

    if (savingRef.current) {
      pendingRetryRef.current = true;
      return;
    }

    if (lastSavedBodyRef.current === bodyRef.current) {
      return;
    }

    savingRef.current = true;
    pendingRetryRef.current = false;
    setSaveState("saving");

    try {
      while (
        activeNoteIdRef.current === noteId &&
        phaseRef.current === "writing" &&
        lastSavedBodyRef.current !== bodyRef.current
      ) {
        const toSave = bodyRef.current;
        await updateNoteAsyncRef.current({
          noteId,
          payload: { body: toSave },
        });

        if (
          activeNoteIdRef.current === noteId &&
          bodyRef.current === toSave
        ) {
          lastSavedBodyRef.current = toSave;
        }
      }

      if (activeNoteIdRef.current === noteId) {
        setSaveState(
          lastSavedBodyRef.current === bodyRef.current ? "saved" : "idle",
        );
      }
      toastedSaveErrorRef.current = false;
    } catch (err) {
      setSaveState("error");
      if (!toastedSaveErrorRef.current) {
        toastedSaveErrorRef.current = true;
        toastApiError(err, "Não foi possível salvar a nota.");
      }
    } finally {
      savingRef.current = false;
      if (
        pendingRetryRef.current ||
        (activeNoteIdRef.current === noteId &&
          phaseRef.current === "writing" &&
          lastSavedBodyRef.current !== bodyRef.current)
      ) {
        pendingRetryRef.current = false;
        scheduleSave();
      }
    }
  };

  useEffect(() => {
    return () => {
      clearSaveTimer();
    };
  }, [clearSaveTimer]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        clearSaveTimer();
        void flushSaveRef.current();
      }
    }

    function onPageHide() {
      clearSaveTimer();
      void flushSaveRef.current();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [clearSaveTimer]);

  function resetComposer() {
    clearSaveTimer();
    setPhase("setup");
    setActiveNoteId(null);
    setBody("");
    setVisibility("public");
    setRoleIds([]);
    setFormError(null);
    setSaveState("idle");
    lastSavedBodyRef.current = null;
    pendingRetryRef.current = false;
    toastedSaveErrorRef.current = false;
  }

  function openCreate() {
    resetComposer();
    setComposerOpen(true);
  }

  function openEdit(note: EventNote) {
    clearSaveTimer();
    setComposerOpen(true);
    setPhase("writing");
    setActiveNoteId(note.id);
    setBody(note.body);
    setVisibility(note.visibility);
    setRoleIds(note.roles.map((role) => role.id));
    setFormError(null);
    setSaveState("saved");
    lastSavedBodyRef.current = note.body;
  }

  async function closeComposer() {
    clearSaveTimer();
    await flushSaveRef.current();

    const noteId = activeNoteIdRef.current;
    if (noteId && isEventNoteBodyEmpty(bodyRef.current)) {
      try {
        await deleteNote.mutateAsync(noteId);
      } catch {
        // Se falhar, a nota vazia fica listada como rascunho.
      }
    }

    resetComposer();
    setComposerOpen(false);
  }

  function toggleRole(roleId: string) {
    setRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  }

  function validateSetup(): string | null {
    if (visibility === "private" && roleIds.length === 0) {
      return "Escolha ao menos um cargo para a nota privada.";
    }
    return null;
  }

  async function startWriting() {
    const validationError = validateSetup();
    setFormError(validationError);
    if (validationError) {
      return;
    }

    try {
      const note = await createNote.mutateAsync({
        body: emptyEventNoteHtml(),
        visibility,
        ...(visibility === "private" ? { roleIds } : {}),
      });
      setActiveNoteId(note.id);
      setBody(emptyEventNoteHtml());
      lastSavedBodyRef.current = emptyEventNoteHtml();
      setPhase("writing");
      setSaveState("saved");
      setFormError(null);
    } catch (err) {
      toastApiError(err, "Não foi possível criar a nota.");
    }
  }

  async function handleDelete(noteId: string) {
    try {
      if (activeNoteId === noteId) {
        clearSaveTimer();
        resetComposer();
        setComposerOpen(false);
      }
      await deleteNote.mutateAsync(noteId);
      toastSuccess("Nota excluída.");
    } catch (err) {
      toastApiError(err, "Não foi possível excluir a nota.");
    }
  }

  function onBodyChange(value: string) {
    setBody(value);
    setSaveState("idle");
    scheduleSave();
  }

  const saveLabel =
    saveState === "saving"
      ? "Salvando…"
      : saveState === "saved"
        ? "Salvo"
        : saveState === "error"
          ? "Erro ao salvar"
          : "Alterações pendentes";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-domain-activities/25 bg-card shadow-xs">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-domain-activities-subtle/80 to-transparent"
      />

      <div className="relative z-10 space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-domain-activities-subtle text-domain-activities-foreground">
              <NotebookPen className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Notas do evento
              </h2>
              <div className="mt-2.5 h-px w-8 bg-domain-activities" />
              <p className="pt-1 text-sm text-muted-foreground">
                Observações do evento, com salvamento automático. Defina se é
                pública ou privada antes de começar a digitar.
              </p>
            </div>
          </div>

          {canCreate ? (
            <Button
              type="button"
              size="sm"
              variant={composerOpen && phase === "setup" ? "outline" : "default"}
              className="shrink-0"
              disabled={isBusy && composerOpen}
              onClick={() => {
                if (composerOpen && phase === "setup") {
                  void closeComposer();
                  return;
                }
                if (composerOpen && phase === "writing") {
                  return;
                }
                openCreate();
              }}
            >
              {composerOpen && phase === "setup" ? (
                "Fechar"
              ) : (
                <>
                  <Plus className="size-4" />
                  Nova nota
                </>
              )}
            </Button>
          ) : null}
        </div>

        <AnimatePresence initial={false}>
          {composerOpen ? (
            <motion.div
              key={activeNoteId ?? "setup"}
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-4 rounded-xl border border-border bg-background/80 p-4">
                {phase === "setup" ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Nova nota
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Primeiro escolha quem pode ver. Depois você digita — o
                        texto salva sozinho.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Visibilidade
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            { value: "public", label: "Pública" },
                            { value: "private", label: "Privada" },
                          ] as const
                        ).map((option) => {
                          const selected = visibility === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              disabled={createNote.isPending}
                              onClick={() => {
                                setVisibility(option.value);
                                if (option.value === "public") {
                                  setRoleIds([]);
                                }
                              }}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                                selected
                                  ? "border-foreground/20 bg-foreground text-background shadow-xs"
                                  : "border-border bg-card text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {visibility === "private" ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Quem pode ver
                        </p>
                        {roleOptions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Cadastre cargos em Configurações para restringir o
                            acesso.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {roleOptions.map((role) => {
                              const selected = roleIds.includes(role.id);
                              return (
                                <button
                                  key={role.id}
                                  type="button"
                                  disabled={createNote.isPending}
                                  onClick={() => toggleRole(role.id)}
                                  className={cn(
                                    "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                                    selected
                                      ? "border-domain-activities/40 bg-domain-activities-subtle text-domain-activities-foreground"
                                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                                  )}
                                >
                                  {role.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : null}

                    {formError ? (
                      <p className="text-sm text-destructive">{formError}</p>
                    ) : null}

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={createNote.isPending}
                        onClick={() => void closeComposer()}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={createNote.isPending}
                        onClick={() => void startWriting()}
                      >
                        {createNote.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Abrindo…
                          </>
                        ) : (
                          "Começar a escrever"
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {activeNoteId &&
                          notes.some((note) => note.id === activeNoteId)
                            ? "Escrevendo"
                            : "Nota"}
                        </p>
                        {visibility === "private" ? (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="size-3" />
                            Privada
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pública</Badge>
                        )}
                        {visibility === "private"
                          ? roleIds.map((roleId) => {
                              const role = roleOptions.find(
                                (item) => item.id === roleId,
                              );
                              return role ? (
                                <Badge key={role.id} variant="outline">
                                  {role.name}
                                </Badge>
                              ) : null;
                            })
                          : null}
                      </div>
                      <p
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs",
                          saveState === "error"
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {saveState === "saving" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : saveState === "saved" ? (
                          <Check className="size-3.5" />
                        ) : null}
                        {saveLabel}
                      </p>
                    </div>

                    <EventNoteEditor
                      key={activeNoteId ?? "draft"}
                      initialHtml={body}
                      onChange={onBodyChange}
                      onBlur={() => {
                        clearSaveTimer();
                        void flushSaveRef.current();
                      }}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updateNote.isPending}
                        onClick={() => void closeComposer()}
                      >
                        Concluir
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar as notas."}
          </p>
        ) : notes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            {canCreate
              ? "Nenhuma nota ainda. Adicione observações quando precisar."
              : "Nenhuma nota neste evento."}
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {notes.map((note) => {
              const isRowActive =
                composerOpen &&
                phase === "writing" &&
                activeNoteId === note.id;
              const preview =
                note.id === activeNoteId && phase === "writing"
                  ? body
                  : note.body;
              return (
                <li
                  key={note.id}
                  className={cn(
                    "space-y-2 px-4 py-3.5 sm:px-5",
                    isRowActive && "bg-domain-activities-subtle/40",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {note.visibility === "private" ? (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="size-3" />
                        Privada
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pública</Badge>
                    )}
                    {note.visibility === "private" && note.roles.length > 0
                      ? note.roles.map((role) => (
                          <Badge key={role.id} variant="outline">
                            {role.name}
                          </Badge>
                        ))
                      : null}
                    <span className="text-xs text-muted-foreground">
                      {note.authorName} · {formatNoteWhen(note.updatedAt)}
                    </span>
                    {note.canEdit && !interactionsDisabled ? (
                      <div className="ml-auto flex items-center gap-0.5">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-foreground"
                          disabled={isBusy}
                          aria-label="Editar nota"
                          onClick={() => openEdit(note)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          disabled={isBusy}
                          aria-label="Excluir nota"
                          onClick={() => void handleDelete(note.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <EventNoteHtml html={preview} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
