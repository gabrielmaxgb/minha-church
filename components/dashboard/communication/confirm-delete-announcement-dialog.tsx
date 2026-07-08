"use client";

import { useEffect, useId } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Announcement } from "@/types/announcements";

interface ConfirmDeleteAnnouncementDialogProps {
  announcement: Announcement | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteAnnouncementDialog({
  announcement,
  pending,
  onCancel,
  onConfirm,
}: ConfirmDeleteAnnouncementDialogProps) {
  const titleId = useId();
  const open = Boolean(announcement);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
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
  }, [open, pending, onCancel]);

  if (!announcement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Fechar"
        onClick={() => !pending && onCancel()}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight">
              Excluir comunicado
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              O comunicado{" "}
              <strong className="text-foreground">“{announcement.title}”</strong>{" "}
              será removido do mural de todos os destinatários. Esta ação não
              pode ser desfeita.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Excluir comunicado
          </Button>
        </div>
      </div>
    </div>
  );
}
