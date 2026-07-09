"use client";

import { useEffect, useId } from "react";
import { ArrowRight, Check, Compass, Rocket, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  done: boolean;
  optional?: boolean;
}

interface OnboardingChecklistModalProps {
  open: boolean;
  onClose: () => void;
  onSelectStep: (href: string) => void;
  steps: OnboardingStep[];
  churchName: string;
}

export function OnboardingChecklistModal({
  open,
  onClose,
  onSelectStep,
  steps,
  churchName,
}: OnboardingChecklistModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const total = steps.length;
  const completed = steps.filter((step) => step.done).length;
  const allDone = total > 0 && completed === total;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Fechar guia de primeiros passos"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 flex max-h-[min(94dvh,760px)] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start gap-4 px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Rocket className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id={titleId}
              className="font-display text-xl font-semibold tracking-tight"
            >
              Primeiros passos
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
              Um guia rápido para você dar os primeiros passos na{" "}
              <span className="font-medium text-foreground">{churchName}</span>.
              É só uma sugestão — você pode fechar quando quiser e explorar o
              painel livremente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="px-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {completed} de {total} concluído{completed === 1 ? "" : "s"}
            </span>
            {allDone && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3.5" aria-hidden />
                Tudo pronto!
              </span>
            )}
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Separator className="mt-5" />

        <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-6 py-5">
          {steps.map((step) => (
            <li key={step.id}>
              <div
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 transition-colors",
                  step.done
                    ? "border-emerald-500/25 bg-emerald-500/6"
                    : "border-border/70 bg-surface-elevated/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                    step.done
                      ? "border-emerald-500/40 bg-emerald-500 text-white"
                      : "border-border bg-background text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {step.done ? <Check className="size-3.5" /> : null}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold text-foreground",
                        step.done && "text-muted-foreground line-through",
                      )}
                    >
                      {step.title}
                    </p>
                    {step.optional && !step.done && (
                      <Badge variant="secondary" className="text-[10px]">
                        Opcional
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  {!step.done && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-1.5"
                      onClick={() => onSelectStep(step.href)}
                    >
                      {step.actionLabel}
                      <ArrowRight className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Separator />

        <footer className="flex flex-col gap-2 px-6 py-4">
          <Button type="button" onClick={onClose} className="w-full gap-2">
            <Compass className="size-4" />
            {allDone ? "Explorar o painel" : "Explorar por conta própria"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Você pode reabrir este guia quando quiser pelo botão
            &ldquo;Primeiros passos&rdquo;.
          </p>
        </footer>
      </div>
    </div>
  );
}
