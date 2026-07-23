"use client";

import { useEffect, useId } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MEMBER_RETENTION_DAYS } from "@/constants/legal";

interface ChurchClosureBackupDialogProps {
  open: boolean;
  churchName: string;
  downloading: boolean;
  closing: boolean;
  downloaded: boolean;
  onCancel: () => void;
  onDownload: () => void;
  onConfirmClose: () => void;
}

export function ChurchClosureBackupDialog({
  open,
  churchName,
  downloading,
  closing,
  downloaded,
  onCancel,
  onDownload,
  onConfirmClose,
}: ChurchClosureBackupDialogProps) {
  const titleId = useId();
  const busy = downloading || closing;

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
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
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        aria-label="Fechar"
        disabled={busy}
        onClick={() => {
          if (!busy) onCancel();
        }}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md animate-in fade-in-0 zoom-in-95 rounded-t-2xl border border-border bg-background p-6 shadow-popover duration-150 sm:rounded-2xl"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Download className="size-5" aria-hidden />
        </div>

        <h2
          id={titleId}
          className="mt-4 text-lg font-semibold tracking-tight"
        >
          Salve os dados no computador
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Antes de encerrar{" "}
          <strong className="font-medium text-foreground">{churchName}</strong>,
          baixe uma cópia com membros, famílias, ministérios e comunicados.
          Depois do prazo de {MEMBER_RETENTION_DAYS} dias, esses dados são
          anonimizados.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Dados de pagamento não entram no arquivo.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            type="button"
            onClick={onDownload}
            disabled={busy}
            className="w-full"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {downloading
              ? "Baixando..."
              : downloaded
                ? "Baixar de novo"
                : "Baixar cópia agora"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirmClose}
            disabled={busy}
            className="w-full"
          >
            {closing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {closing
              ? "Encerrando..."
              : downloaded
                ? "Continuar e encerrar"
                : "Encerrar sem baixar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={busy}
            className="w-full"
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
