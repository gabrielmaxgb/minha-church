"use client";

import { useEffect, useId, useRef } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getTierBillingComparison,
  getTierMonthlyPrice,
} from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";
import type { BillingPeriod, PricingTier } from "@/types";

type CheckoutModalPhase = "confirming" | "success" | "error";

interface CheckoutSuccessModalProps {
  open: boolean;
  phase: CheckoutModalPhase;
  churchName: string;
  tier: PricingTier | null;
  period: BillingPeriod;
  errorMessage?: string | null;
  onRetry?: () => void;
  onClose: () => void;
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

export function CheckoutSuccessModal({
  open,
  phase,
  churchName,
  tier,
  period,
  errorMessage,
  onRetry,
  onClose,
}: CheckoutSuccessModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const monthlyPrice = tier ? getTierMonthlyPrice(tier, period) : 0;
  const billingComparison = tier ? getTierBillingComparison(tier) : null;

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
    if (!open || phase === "confirming") {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, phase]);

  if (!open) {
    return null;
  }

  const canDismissOverlay = phase !== "confirming";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {canDismissOverlay ? (
        <button
          type="button"
          className="absolute inset-0 bg-foreground/30"
          aria-label="Fechar"
          onClick={onClose}
        />
      ) : (
        <div
          className="absolute inset-0 bg-foreground/30"
          aria-hidden
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={phase === "confirming"}
        className={cn(
          "relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-popover",
        )}
      >
        {phase === "confirming" ? (
          <>
            <div className="border-b border-border/80 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Loader2 className="size-6 animate-spin" aria-hidden />
                </div>
                <div>
                  <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                    Confirmando pagamento
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Estamos validando sua assinatura para{" "}
                    <span className="font-medium text-foreground">{churchName}</span>.
                    Isso leva só alguns segundos.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-8">
              <p className="text-center text-sm text-muted-foreground">
                Seu pagamento no Stripe foi concluído. Aguarde enquanto liberamos
                o painel.
              </p>
            </div>
          </>
        ) : null}

        {phase === "error" ? (
          <>
            <div className="border-b border-border/80 bg-attention-subtle px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-attention text-white">
                    <AlertCircle className="size-6" aria-hidden />
                  </div>
                  <div>
                    <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                      Pagamento recebido, confirmação pendente
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Seu pagamento foi processado pelo Stripe, mas não
                      conseguimos confirmar a assinatura agora. Seu acesso pode
                      ser liberado em instantes.
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
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="rounded-xl border border-attention-border bg-attention-subtle px-4 py-3 text-sm text-attention-foreground">
                {errorMessage ??
                  "Não foi possível confirmar o pagamento. Tente novamente."}
              </div>
              <p className="text-sm text-muted-foreground">
                Se o problema persistir, aguarde um minuto e clique em tentar
                novamente — ou recarregue a página. O comprovante foi enviado ao
                e-mail usado no checkout.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-border/80 px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button type="button" onClick={onRetry}>
                Tentar novamente
              </Button>
            </div>
          </>
        ) : null}

        {phase === "success" && tier ? (
          <>
            <div className="border-b border-border/80 bg-success-subtle px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success text-white">
                    <CheckCircle2 className="size-6" aria-hidden />
                  </div>
                  <div>
                    <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                      Parabéns! Assinatura confirmada
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Obrigado por confiar no Minha Church para organizar{" "}
                      <span className="font-medium text-foreground">{churchName}</span>.
                      Seu pagamento foi recebido e a assinatura está ativa.
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
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success-subtle px-4 py-3 text-sm text-success-foreground">
                <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>
                  Tudo certo! Membros, ministérios, escalas e comunicados já estão
                  disponíveis para sua equipe.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Resumo da assinatura
                </p>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Plano</dt>
                    <dd className="text-right font-medium">{tier.name}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Faixa</dt>
                    <dd className="max-w-[14rem] text-right text-foreground">
                      {tier.memberRange}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="text-right">
                      {period === "monthly" ? (
                        <>
                          <span className="font-semibold">
                            {formatCurrency(monthlyPrice)}
                          </span>
                          <span className="text-muted-foreground"> / mês</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">
                            {formatCurrency(tier.yearlyPrice)}
                          </span>
                          <span className="text-muted-foreground"> / ano</span>
                          {billingComparison ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Equivalente a {formatCurrency(monthlyPrice)}/mês ·{" "}
                              {billingComparison.monthsFree} meses grátis (
                              {formatCurrency(billingComparison.savings)} de
                              economia)
                            </p>
                          ) : null}
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <InfoRow icon={RefreshCw} title="Cobrança recorrente">
                {period === "monthly" ? (
                  <>
                    A cobrança de {formatCurrency(monthlyPrice)} será feita
                    automaticamente todo mês no cartão informado no checkout, até
                    você cancelar a assinatura.
                  </>
                ) : (
                  <>
                    A cobrança de {formatCurrency(tier.yearlyPrice)} será renovada
                    automaticamente a cada 12 meses no cartão informado no checkout,
                    até você cancelar a assinatura.
                  </>
                )}
              </InfoRow>

              <InfoRow icon={CalendarClock} title="Próximas faturas">
                Você receberá avisos e comprovantes por e-mail antes de cada
                renovação. O valor pode ser ajustado se a faixa de membros da igreja
                mudar conforme o crescimento da congregação.
              </InfoRow>

              <InfoRow icon={Mail} title="Comprovante">
                O Stripe enviou o recibo do pagamento para o e-mail usado no
                checkout. Guarde-o para seu controle financeiro.
              </InfoRow>

              <InfoRow icon={CreditCard} title="Forma de pagamento">
                O cartão cadastrado no checkout será usado nas próximas cobranças.
                Para alterar dados de pagamento, ver faturas ou cancelar, acesse{" "}
                <span className="font-medium text-foreground">
                  Configurações → Assinatura
                </span>{" "}
                e abra a gestão pelo Stripe.
              </InfoRow>
            </div>

            <div className="border-t border-border/80 px-6 py-4">
              <Button type="button" className="w-full" onClick={onClose}>
                Começar a usar
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
