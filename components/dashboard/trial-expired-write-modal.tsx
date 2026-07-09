"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";

interface TrialExpiredWriteModalProps {
  open: boolean;
  onClose: () => void;
  /** Contexto opcional, ex.: "criar comunicados". */
  action?: string;
}

export function TrialExpiredWriteModal({
  open,
  onClose,
  action = "fazer alterações",
}: TrialExpiredWriteModalProps) {
  if (!open) {
    return null;
  }

  return (
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
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-background p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
          <Lock className="size-5" aria-hidden />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">
          Período de teste encerrado
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Você ainda pode consultar o painel e cadastrar membros, mas não é
          possível {action} sem um plano ativo. O que você já criou continua
          disponível para consulta.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Agora não
          </Button>
          <Button asChild>
            <Link href={PUBLIC_ROUTES.pricing}>Ver planos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
