"use client";

import Link from "next/link";
import { AlertTriangle, Clock, CreditCard, Lock, Sparkles } from "lucide-react";

import { BillingNotice } from "@/components/billing/billing-notice";
import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/constants/routes";
import { useBillingPortalAction } from "@/lib/billing/use-billing-portal";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
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
      <BillingNotice
        tone="urgent"
        icon={AlertTriangle}
        title="Pagamento da assinatura pendente"
        description="Não conseguimos cobrar a renovação. Atualize o cartão para continuar editando ministérios, comunicados e configurações."
        action={
          <div className="flex flex-col gap-2 sm:items-end">
            <Button
              type="button"
              size="sm"
              className="w-full gap-2 bg-billing text-white hover:bg-billing/90 sm:w-auto"
              disabled={portalLoading}
              onClick={() => void openPortal()}
            >
              <CreditCard className="size-4" />
              Atualizar pagamento
            </Button>
            <Link
              href={`${AUTH_ROUTES.settings}?section=subscription`}
              className="text-center text-xs text-billing-foreground underline-offset-4 hover:underline sm:text-right"
            >
              Ver detalhes da assinatura
            </Link>
          </div>
        }
      />
    );
  }

  if (locked) {
    const isCanceled = subscriptionStatus === "canceled";

    return (
      <BillingNotice
        tone="critical"
        icon={Lock}
        title={
          isCanceled
            ? "Sua assinatura foi encerrada"
            : "Seu período de teste terminou"
        }
        description={
          isCanceled
            ? "Você ainda pode consultar o painel e cadastrar novos membros. Para voltar a editar ministérios, atividades e comunicados, reative a assinatura."
            : "Você ainda pode consultar o painel, ver o que já criou e cadastrar novos membros. Para editar ministérios, atividades, comunicados e configurações, assine a faixa do tamanho da sua igreja."
        }
        action={
          <SubscribePricingTrigger className="w-full bg-billing text-white hover:bg-billing/90 sm:w-auto">
            {isCanceled ? "Reativar assinatura" : "Assinar agora"}
          </SubscribePricingTrigger>
        }
      />
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
    <BillingNotice
      tone={isUrgent ? "urgent" : "info"}
      icon={isUrgent ? Clock : Sparkles}
      title="Você está no período de teste gratuito"
      description={
        <>
          {countdownMessage}{" "}
          {isUrgent
            ? "Veja a faixa da sua igreja para continuar gerenciando tudo sem interrupção."
            : "Explore com calma — a cobrança só começa se você decidir continuar após o teste."}
        </>
      }
      action={
        <SubscribePricingTrigger
          variant={isUrgent ? "default" : "outline"}
          className={
            isUrgent
              ? "w-full bg-billing text-white hover:bg-billing/90 sm:w-auto"
              : "w-full border-billing/30 bg-card/80 text-billing-foreground hover:bg-billing-subtle sm:w-auto"
          }
        >
          Assinar agora
        </SubscribePricingTrigger>
      }
    />
  );
}
