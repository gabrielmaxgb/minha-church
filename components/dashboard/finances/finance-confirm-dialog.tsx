"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2, Trash2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmTone = "destructive" | "warning" | "neutral";

export function FinanceConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmingLabel,
  tone = "neutral",
  icon: Icon,
  isPending,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  confirmingLabel: string;
  tone?: ConfirmTone;
  icon?: LucideIcon;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ResolvedIcon =
    Icon ?? (tone === "destructive" ? Trash2 : tone === "warning" ? Undo2 : Undo2);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        aria-label="Fechar"
        disabled={isPending}
        onClick={() => {
          if (!isPending) {
            onCancel();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-confirm-title"
        className="relative z-10 w-full max-w-md animate-in fade-in-0 zoom-in-95 rounded-t-2xl border border-border bg-background p-6 shadow-popover duration-150 sm:rounded-2xl"
      >
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl",
            tone === "destructive" && "bg-destructive/10 text-destructive",
            tone === "warning" && "bg-amber-500/10 text-amber-700",
            tone === "neutral" && "bg-muted text-muted-foreground",
          )}
        >
          <ResolvedIcon className="size-5" aria-hidden />
        </div>

        <h2
          id="finance-confirm-title"
          className="mt-4 text-lg font-semibold tracking-tight"
        >
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
            className="w-full gap-2 sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ResolvedIcon className="size-4" />
            )}
            {isPending ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
