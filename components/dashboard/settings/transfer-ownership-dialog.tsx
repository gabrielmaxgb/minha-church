"use client";

import { useEffect, useId } from "react";
import { Crown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChurchMembership } from "@/types/church-memberships";

interface TransferOwnershipDialogProps {
  membership: ChurchMembership | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TransferOwnershipDialog({
  membership,
  pending,
  onCancel,
  onConfirm,
}: TransferOwnershipDialogProps) {
  const titleId = useId();
  const open = Boolean(membership);

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

  if (!membership) {
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
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-700 dark:text-amber-300">
            <Crown className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-lg font-semibold tracking-tight"
            >
              Transferir propriedade
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong className="text-foreground">{membership.user.name}</strong>{" "}
              passará a ser o proprietário da igreja. Você perderá esse papel e
              receberá o cargo de{" "}
              <strong className="text-foreground">Membro</strong>, mantendo os
              demais cargos que já possui.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Essa pessoa poderá transferir a propriedade novamente, gerenciar
              todos os acessos e terá as permissões máximas da igreja.
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
          <Button type="button" onClick={onConfirm} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Confirmar transferência
          </Button>
        </div>
      </div>
    </div>
  );
}
