"use client";

import { useEffect, useId, useState } from "react";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChurchMembership } from "@/types/church-memberships";

interface TransferOwnershipDialogProps {
  membership: ChurchMembership | null;
  pending: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (password: string) => void;
}

export function TransferOwnershipDialog({
  membership,
  pending,
  error,
  onCancel,
  onConfirm,
}: TransferOwnershipDialogProps) {
  const titleId = useId();
  const passwordId = useId();
  const open = Boolean(membership);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setShowPassword(false);
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

  const canConfirm = password.trim().length > 0 && !pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        onClick={() => !pending && onCancel()}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-popover"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-attention-border bg-attention-subtle text-attention-foreground">
            <AlertTriangle className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-lg font-semibold tracking-tight"
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
            <p className="mt-2 text-sm text-muted-foreground">
              Na primeira entrada como proprietário, será necessário confirmar o
              e-mail cadastrado no membro antes de acessar o painel.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor={passwordId}>Confirme com sua senha</Label>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              autoFocus
              value={password}
              disabled={pending}
              placeholder="Digite sua senha"
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canConfirm) {
                  onConfirm(password);
                }
              }}
              aria-invalid={Boolean(error)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={pending}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
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
            disabled={!canConfirm}
            onClick={() => onConfirm(password)}
            className="border border-attention-border bg-attention-mark text-attention-foreground hover:bg-attention-emphasis/40 disabled:opacity-50"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Confirmar transferência
          </Button>
        </div>
      </div>
    </div>
  );
}
