"use client";

import { useEffect, useId } from "react";
import { BookOpen, X } from "lucide-react";

import { ChartOfAccountsPanel } from "@/components/dashboard/finances/chart-of-accounts-panel";
import { Button } from "@/components/ui/button";
import { ModalPortal } from "@/components/ui/modal-portal";

type ChartOfAccountsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ChartOfAccountsModal({
  open,
  onClose,
}: ChartOfAccountsModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          aria-label="Fechar"
          onClick={onClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative z-10 flex max-h-[min(92dvh,840px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-popover sm:rounded-2xl"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-domain-finances-subtle/80 to-transparent"
            aria-hidden
          />

          <header className="relative flex items-start gap-3 border-b border-border/70 px-4 py-4 sm:px-5 sm:py-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-domain-finances-subtle text-domain-finances-foreground">
              <BookOpen className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2
                id={titleId}
                className="font-display text-lg font-semibold tracking-tight text-foreground"
              >
                Categorias do caixa
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Tipos de entrada e saída usados no Caixa e no relatório.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X className="size-4" />
            </Button>
          </header>

          <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <ChartOfAccountsPanel embedded compact />
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
