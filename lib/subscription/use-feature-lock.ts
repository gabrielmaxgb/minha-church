"use client";

import { useAuth } from "@/providers/auth-provider";
import type { SubscriptionLockReason, SubscriptionStatus } from "@/types/auth";

/** Copy de bloqueio por motivo. Usada quando não há motivo específico. */
export const FEATURE_LOCKED_REASON =
  "Para liberar essa ação, escolha o plano da sua igreja — a gente te acompanha.";

export const MEMBER_ACCESS_LOCKED_REASON =
  "Você pode cadastrar visitantes com calma. Para receber alguém como membro (com acesso ao app), escolha um plano para a sua igreja.";

/** Mensagens específicas por motivo de bloqueio. */
export const LOCK_REASON_MESSAGES: Record<SubscriptionLockReason, string> = {
  trial_expired:
    "Seu teste gratuito terminou. Escolha um plano para continuar editando e cuidando da igreja com a equipe.",
  past_due:
    "Não conseguimos renovar o pagamento. Atualize o cartão para voltar a editar com tranquilidade.",
  canceled:
    "Sua assinatura pausou. Reative quando quiser retomar a edição completa — seu espaço continua aqui.",
};

export interface FeatureLockState {
  locked: boolean;
  reason: string | null;
  reasonCode: SubscriptionLockReason | null;
  trialDaysRemaining: number | null;
  subscriptionStatus: SubscriptionStatus | null;
  trialEndsAt: string | null;
  /** true durante trial válido — recursos premium liberados gratuitamente. */
  isTrialing: boolean;
}

/**
 * Estado da assinatura/trial da igreja ativa. `locked` indica que recursos
 * premium (ministérios, atividades, escalas, recebimentos, edição de membros)
 * estão bloqueados. Durante o trial válido tudo fica liberado.
 */
export function useFeatureLock(): FeatureLockState {
  const { church } = useAuth();
  const locked = Boolean(church?.featuresLocked);
  const reasonCode = locked ? (church?.lockReason ?? "trial_expired") : null;

  return {
    locked,
    reason: reasonCode ? LOCK_REASON_MESSAGES[reasonCode] : null,
    reasonCode,
    trialDaysRemaining: church?.trialDaysRemaining ?? null,
    subscriptionStatus: church?.subscriptionStatus ?? null,
    trialEndsAt: church?.trialEndsAt ?? null,
    isTrialing:
      church?.subscriptionStatus === "trialing" && !locked,
  };
}
