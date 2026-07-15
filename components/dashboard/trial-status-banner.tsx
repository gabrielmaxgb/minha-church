"use client";

import Link from "next/link";
import { AlertTriangle, Clock, CreditCard, HeartHandshake, Sparkles } from "lucide-react";

import { BillingNotice } from "@/components/billing/billing-notice";
import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/constants/routes";
import { useBillingPortalAction } from "@/lib/billing/use-billing-portal";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { useAuth } from "@/providers/auth-provider";

import { URGENT_TRIAL_THRESHOLD_DAYS } from "./trial-status-shared";

function formatTrialEndDate(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
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

/**
 * Banner grande — só past_due, bloqueado ou trial urgente (≤7 dias).
 * Trial calmo fica no chip do topbar.
 */
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
        description="Não conseguimos cobrar a renovação. Atualize o cartão para continuar editando ministérios, comunicados, recebimentos e configurações."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <Button
              type="button"
              size="default"
              className="w-full min-w-40 gap-2 bg-[#f4f4f1] font-semibold text-[#1a1a18] shadow-xs hover:bg-white sm:w-auto"
              disabled={portalLoading}
              onClick={() => void openPortal()}
            >
              <CreditCard className="size-4" />
              Atualizar pagamento
            </Button>
            <Link
              href={`${AUTH_ROUTES.settings}?section=subscription`}
              className="text-center text-xs text-[#f4f4f1]/70 underline-offset-4 hover:text-[#f4f4f1] hover:underline sm:text-right"
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
        tone="info"
        icon={isCanceled ? HeartHandshake : Sparkles}
        title={
          isCanceled
            ? "Sua assinatura pausou — a gente te espera de volta"
            : "Obrigado por experimentar — vamos seguir juntos?"
        }
        description={
          isCanceled
            ? "Seu painel continua aqui para consulta e para cadastrar visitantes. Quando quiser retomar membros, ministérios e o dia a dia completo, é só reativar — com carinho, no tempo da sua igreja."
            : "Seu teste gratuito chegou ao fim, mas nada do que você criou se perde. Continua podendo olhar o painel e cadastrar visitantes. Para receber membros e cuidar de ministérios, atividades e o resto com a equipe, escolha a faixa que cabe na sua igreja."
        }
        action={
          <SubscribePricingTrigger inverted className="w-full sm:w-auto">
            {isCanceled ? "Reativar assinatura" : "Escolher meu plano"}
          </SubscribePricingTrigger>
        }
      />
    );
  }

  const isUrgentTrial =
    subscriptionStatus === "trialing" &&
    trialDaysRemaining !== null &&
    trialDaysRemaining <= URGENT_TRIAL_THRESHOLD_DAYS;

  if (!isUrgentTrial) {
    return null;
  }

  const countdownMessage = buildTrialCountdownMessage(
    trialDaysRemaining,
    trialEndsAt,
  );

  return (
    <BillingNotice
      tone="urgent"
      icon={Clock}
      title="Você está no período de teste gratuito"
      description={
        <>
          {countdownMessage} Veja a faixa da sua igreja para continuar
          gerenciando tudo sem interrupção.
        </>
      }
      action={
        <SubscribePricingTrigger inverted className="w-full sm:w-auto">
          Assinar agora
        </SubscribePricingTrigger>
      }
    />
  );
}
