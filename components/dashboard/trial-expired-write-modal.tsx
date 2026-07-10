"use client";

import { Lock } from "lucide-react";

import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { Button } from "@/components/ui/button";

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
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-t-xl border border-border bg-background p-6 shadow-popover sm:rounded-xl"
      >
        <div className="flex size-11 items-center justify-center rounded-lg bg-destructive/12 text-destructive">
          <Lock className="size-5" aria-hidden />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          Período de teste encerrado
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Você ainda pode consultar o painel e cadastrar membros. Para{" "}
          {action}, assine a faixa correspondente ao tamanho da sua igreja.
          Tudo o que você já criou continua disponível para consulta.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Agora não
          </Button>
          <SubscribePricingTrigger onOpen={onClose} size="default">
            Assinar agora
          </SubscribePricingTrigger>
        </div>
      </div>
    </div>
  );
}
