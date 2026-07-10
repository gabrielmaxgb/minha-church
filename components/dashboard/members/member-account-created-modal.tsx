"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, KeyRound, Link2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MemberAccountCredentials } from "@/types/members";
import { cn } from "@/lib/utils";

interface MemberAccountCreatedModalProps {
  open: boolean;
  memberName: string;
  account: MemberAccountCredentials;
  onClose: () => void;
}

function CopyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <code className="flex-1 truncate text-sm">{value}</code>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={handleCopy}
          aria-label={`Copiar ${label.toLowerCase()}`}
        >
          {copied ? (
            <Check className="size-4 text-emerald-600" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function MemberAccountCreatedModal({
  open,
  memberName,
  account,
  onClose,
}: MemberAccountCreatedModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isLinked = account.kind === "linked";

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              {isLinked ? (
                <Link2 className="size-5" aria-hidden />
              ) : (
                <KeyRound className="size-5" aria-hidden />
              )}
            </div>
            <div>
              <h2 id={titleId} className="font-display text-lg font-semibold">
                {isLinked ? "Conta existente vinculada" : "Login criado"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLinked
                  ? `${memberName} já tinha conta MinhaChurch. O acesso a esta igreja foi liberado com o login atual — sem senha nova.`
                  : `Compartilhe as credenciais com ${memberName}. No primeiro acesso, será necessário definir uma nova senha.`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <CopyField label="Login (e-mail ou CPF)" value={account.login} />
          {account.kind === "created" && (
            <CopyField
              label="Senha temporária"
              value={account.temporaryPassword}
            />
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onClose}>
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
}
