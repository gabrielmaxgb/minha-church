"use client";

import { useEffect, useId } from "react";
import { ArrowRight, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TransferSingleHolderRoleDialogProps {
  open: boolean;
  roleName: string;
  currentHolderName: string;
  newHolderName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TransferSingleHolderRoleDialog({
  open,
  roleName,
  currentHolderName,
  newHolderName,
  onCancel,
  onConfirm,
}: TransferSingleHolderRoleDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        onClick={onCancel}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md animate-in fade-in-0 zoom-in-95 rounded-t-2xl border border-border bg-background p-6 shadow-popover duration-150 sm:rounded-2xl"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-attention-subtle text-attention-foreground">
          <Crown className="size-5" aria-hidden />
        </div>

        <h2
          id={titleId}
          className="mt-4 text-lg font-semibold tracking-tight"
        >
          Passar “{roleName}” adiante?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Este cargo é titular único — só uma pessoa por vez. Ao confirmar, ele
          sai de quem tem hoje e passa para a nova pessoa.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Deixa de ter
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">
              {currentHolderName}
            </p>
          </div>
          <ArrowRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Passa a ter
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">
              {newHolderName}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="w-full border border-attention-border bg-attention-mark text-attention-foreground hover:bg-attention-emphasis/40 sm:w-auto"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
