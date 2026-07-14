"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  CheckCircle2,
  HeartHandshake,
  Home,
  Loader2,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCareRequest } from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import {
  type CareRequestRecipient,
  type CareRequestType,
} from "@/types/care-requests";

const TYPE_OPTIONS: Record<
  CareRequestType,
  {
    label: string;
    description: string;
    icon: typeof HeartHandshake;
  }
> = {
  counseling: {
    label: "Aconselhamento",
    description: "Uma conversa pastoral, no ritmo de quem recebe.",
    icon: HeartHandshake,
  },
  visit: {
    label: "Visita",
    description: "Peça uma visita presencial — igreja ou em casa.",
    icon: Home,
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

interface CreateCareRequestModalProps {
  recipient: CareRequestRecipient | null;
  open: boolean;
  onClose: () => void;
}

export function CreateCareRequestModal({
  recipient,
  open,
  onClose,
}: CreateCareRequestModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const createRequest = useCreateCareRequest();

  const [type, setType] = useState<CareRequestType>("counseling");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"form" | "success">("form");

  useEffect(() => {
    if (!open) return;
    setType("counseling");
    setMessage("");
    setError(null);
    setPhase("form");
  }, [open, recipient?.id]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createRequest.isPending && phase === "form") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, createRequest.isPending, phase]);

  useEffect(() => {
    if (!open || phase !== "form") return;
    // Deixa o overlay assentar e foca o botão fechar (teclado / leitores).
    const id = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open, phase, recipient?.id]);

  useEffect(() => {
    if (phase !== "success") return;
    const id = window.setTimeout(() => onClose(), 1600);
    return () => window.clearTimeout(id);
  }, [phase, onClose]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!recipient || createRequest.isPending) return;

    setError(null);

    try {
      await createRequest.mutateAsync({
        recipientMemberId: recipient.id,
        type,
        message: message.trim() || undefined,
      });
      setPhase("success");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar a solicitação.",
      );
    }
  }

  const charsLeft = 500 - message.length;
  const selectedMeta = TYPE_OPTIONS[type];

  return (
    <AnimatePresence>
      {open && recipient ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
            aria-label="Fechar"
            disabled={createRequest.isPending || phase === "success"}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!createRequest.isPending && phase === "form") onClose();
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, y: 28, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? undefined
                : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative z-10 flex max-h-[min(920px,100dvh)] w-full max-w-md flex-col overflow-hidden rounded-t-[1.35rem] border border-border bg-card shadow-popover sm:rounded-2xl"
          >
            <AnimatePresence mode="wait" initial={false}>
              {phase === "success" ? (
                <motion.div
                  key="success"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  className="flex flex-col items-center px-6 py-12 text-center sm:px-8 sm:py-14"
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-domain-communication-subtle text-domain-communication-foreground">
                    <CheckCircle2 className="size-7" aria-hidden />
                  </div>
                  <h2
                    id={titleId}
                    className="mt-5 text-xl font-semibold tracking-tight text-foreground"
                  >
                    Pedido a caminho
                  </h2>
                  <p
                    id={descriptionId}
                    className="mt-2 max-w-[30ch] text-sm leading-relaxed text-muted-foreground"
                  >
                    {recipient.name} já foi avisado
                    {selectedMeta
                      ? ` do pedido de ${selectedMeta.label.toLowerCase()}`
                      : ""}
                    . Em Meus pedidos você vê quando a pessoa ler.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                >
                  <div className="flex items-start gap-3 border-b border-border/80 px-5 pb-4 pt-5 sm:px-6">
                    <div
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-domain-communication-subtle text-sm font-semibold tracking-wide text-domain-communication-foreground"
                      aria-hidden
                    >
                      {getInitials(recipient.name)}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[0.7rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                        Novo pedido
                      </p>
                      <h2
                        id={titleId}
                        className="mt-0.5 truncate text-lg font-semibold tracking-tight text-foreground"
                      >
                        {recipient.name}
                      </h2>
                      {recipient.roles.length > 0 ? (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {recipient.roles.join(" · ")}
                        </p>
                      ) : null}
                      <p id={descriptionId} className="sr-only">
                        Escolha o tipo de pedido. A mensagem é opcional.
                      </p>
                    </div>
                    <Button
                      ref={closeRef}
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 rounded-full text-muted-foreground"
                      disabled={createRequest.isPending}
                      aria-label="Fechar"
                      onClick={onClose}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <form
                    onSubmit={(event) => void handleSubmit(event)}
                    className="flex flex-col gap-5 px-5 py-5 sm:px-6"
                  >
                    <fieldset className="space-y-2.5">
                      <legend className="text-sm font-medium text-foreground">
                        O que você precisa?
                      </legend>
                      <div
                        className="grid gap-2"
                        role="radiogroup"
                        aria-label="Tipo de pedido"
                      >
                        {(
                          Object.keys(TYPE_OPTIONS) as CareRequestType[]
                        ).map((value) => {
                          const option = TYPE_OPTIONS[value];
                          const Icon = option.icon;
                          const selected = type === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => setType(value)}
                              className={cn(
                                "group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200",
                                selected
                                  ? "border-foreground/25 bg-domain-communication-subtle shadow-xs"
                                  : "border-border bg-surface-elevated/60 hover:border-foreground/15 hover:bg-muted/35",
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                                  selected
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-muted-foreground group-hover:text-foreground",
                                )}
                              >
                                <Icon className="size-4" aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-foreground">
                                  {option.label}
                                </span>
                                <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
                                  {option.description}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "mt-1 size-4 shrink-0 rounded-full border transition-colors",
                                  selected
                                    ? "border-foreground bg-foreground shadow-[inset_0_0_0_3px_var(--card)]"
                                    : "border-border",
                                )}
                                aria-hidden
                              />
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <label
                          htmlFor="care-request-message"
                          className="text-sm font-medium text-foreground"
                        >
                          Mensagem
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · opcional
                          </span>
                        </label>
                        <span
                          className={cn(
                            "text-xs tabular-nums",
                            charsLeft < 40
                              ? "text-attention-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {message.length}/500
                        </span>
                      </div>
                      <Textarea
                        id="care-request-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Se quiser, conte um pouco do contexto — só quem recebe o pedido vê."
                        className="min-h-[112px]"
                      />
                    </div>

                    {error ? <FormAlert>{error}</FormAlert> : null}

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      A pessoa recebe aviso no app e por e-mail. Em Meus pedidos
                      você acompanha se já leram.
                    </p>

                    <div className="flex flex-col-reverse gap-2 border-t border-border/80 pt-4 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={createRequest.isPending}
                        onClick={onClose}
                        className="sm:min-w-24"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createRequest.isPending}
                        className="gap-2 sm:min-w-44"
                      >
                        {createRequest.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Enviando…
                          </>
                        ) : (
                          "Enviar pedido"
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
