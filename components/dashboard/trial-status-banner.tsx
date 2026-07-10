"use client";

import Link from "next/link";
import { AlertTriangle, Clock, CreditCard, Lock, Sparkles } from "lucide-react";

import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/constants/routes";
import { useBillingPortalAction } from "@/lib/billing/use-billing-portal";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const URGENT_THRESHOLD_DAYS = 7;

function formatTrialEndDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

function buildTrialCountdownMessage(
  trialDaysRemaining: number,
  trialEndsAt: string | null,
): string {
  const dayLabel = trialDaysRemaining === 1 ? "dia" : "dias";
  const endDateHint =
    trialEndsAt !== null ? ` (até ${formatTrialEndDate(trialEndsAt)})` : "";

  if (trialDaysRemaining === 0) {
    return `Seu teste gratuito termina hoje${endDateHint}.`;
  }

  if (trialDaysRemaining === 1) {
    return `Falta 1 dia de teste gratuito${endDateHint}.`;
  }

  return `Faltam ${trialDaysRemaining} ${dayLabel} de teste gratuito${endDateHint}.`;
}

export function TrialStatusBanner() {
  const { user } = useAuth();
  const {
    locked,
    subscriptionStatus,
    trialDaysRemaining,
    trialEndsAt,
  } = useFeatureLock();
  const { openPortal, loading: portalLoading } = useBillingPortalAction();

  if (!user?.isOwner) {
    return null;
  }

  if (subscriptionStatus === "past_due") {
    return (
      <div className="mb-6 rounded-xl border border-attention-border bg-attention-subtle px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-attention-mark text-attention-foreground">
              <AlertTriangle className="size-4" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Pagamento da assinatura pendente
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Não conseguimos cobrar a renovação. Atualize o cartão para
                continuar editando ministérios, comunicados e configurações.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Button
              type="button"
              size="sm"
              className="w-full gap-2 sm:w-auto"
              disabled={portalLoading}
              onClick={() => void openPortal()}
            >
              <CreditCard className="size-4" />
              Atualizar pagamento
            </Button>
            <Link
              href={`${AUTH_ROUTES.settings}?section=subscription`}
              className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline sm:text-right"
            >
              Ver detalhes da assinatura
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (locked) {
    const isCanceled = subscriptionStatus === "canceled";

    return (
      <div className="mb-6 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/12 text-destructive">
              <Lock className="size-4" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {isCanceled
                  ? "Sua assinatura foi encerrada"
                  : "Seu período de teste terminou"}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {isCanceled
                  ? "Você ainda pode consultar o painel e cadastrar novos membros. Para voltar a editar ministérios, atividades e comunicados, reative a assinatura."
                  : "Você ainda pode consultar o painel, ver o que já criou e cadastrar novos membros. Para editar ministérios, atividades, comunicados e configurações, assine a faixa do tamanho da sua igreja."}
              </p>
            </div>
          </div>
          <div className="sm:shrink-0">
            <SubscribePricingTrigger className="w-full sm:w-auto">
              {isCanceled ? "Reativar assinatura" : "Assinar agora"}
            </SubscribePricingTrigger>
          </div>
        </div>
      </div>
    );
  }

  const isTrialing =
    subscriptionStatus === "trialing" && trialDaysRemaining !== null;

  if (!isTrialing) {
    return null;
  }

  const isUrgent = trialDaysRemaining <= URGENT_THRESHOLD_DAYS;
  const countdownMessage = buildTrialCountdownMessage(
    trialDaysRemaining,
    trialEndsAt,
  );

  return (
    <div
      className={cn(
        "mb-6 rounded-xl border px-4 py-4 sm:px-5",
        isUrgent
          ? "border-attention-border bg-attention-subtle"
          : "border-border bg-muted/40",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
              isUrgent
                ? "bg-attention-mark text-attention-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isUrgent ? (
              <Clock className="size-4" aria-hidden />
            ) : (
              <Sparkles className="size-4" aria-hidden />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Você está no período de teste gratuito
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {countdownMessage}{" "}
              {isUrgent
                ? "Veja a faixa da sua igreja para continuar gerenciando tudo sem interrupção."
                : "Explore com calma — a cobrança só começa se você decidir continuar após o teste."}
            </p>
          </div>
        </div>
        <div className="sm:shrink-0">
          <SubscribePricingTrigger
            variant="outline"
            className="w-full bg-background/80 sm:w-auto"
          >
            Assinar agora
          </SubscribePricingTrigger>
        </div>
      </div>
    </div>
  );
}
