"use client";

import { Sparkles } from "lucide-react";

import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { Button } from "@/components/ui/button";
import { ModalPortal } from "@/components/ui/modal-portal";

interface TrialExpiredWriteModalProps {
  open: boolean;
  onClose: () => void;
  /** Contexto opcional, ex.: "criar comunicados". */
  action?: string;
}

export function TrialExpiredWriteModal({
  open,
  onClose,
  action = "seguir com essa ação",
}: TrialExpiredWriteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <ModalPortal>
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
          className="relative z-10 w-full max-w-md overflow-hidden rounded-t-xl border border-border bg-background p-6 shadow-popover sm:rounded-xl"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#1a1a18]"
            aria-hidden
          />
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#1a1a18] text-[#f4f4f1]">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Assinatura
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Quase lá — vamos continuar juntos?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Seu teste gratuito terminou, mas tudo o que você criou continua aqui.
            Para {action}, escolha a faixa da sua igreja. Pode olhar com calma —
            a gente te acompanha.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Agora não
            </Button>
            <SubscribePricingTrigger onOpen={onClose}>
              Escolher meu plano
            </SubscribePricingTrigger>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
