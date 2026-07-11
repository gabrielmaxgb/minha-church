"use client";

import { useAuth } from "@/providers/auth-provider";
import type { SubscriptionStatus } from "@/types/auth";

export const FEATURE_LOCKED_REASON =
  "Seu período de teste terminou. Você pode consultar o painel e cadastrar membros, mas alterações em ministérios, atividades, comunicados e configurações exigem um plano ativo.";

export const MEMBER_ACCESS_LOCKED_REASON =
  "Seu período de teste terminou. Você pode cadastrar e editar membros, mas liberar acesso ao sistema exige um plano ativo.";

export interface FeatureLockState {
  locked: boolean;
  reason: string | null;
  trialDaysRemaining: number | null;
  subscriptionStatus: SubscriptionStatus | null;
  trialEndsAt: string | null;
}

/**
 * Estado da assinatura/trial da igreja ativa. `locked` indica que o trial
 * expirou e recursos de gestão (criar ministérios/atividades/escalas) estão
 * bloqueados — o cadastro de membros permanece liberado.
 */
export function useFeatureLock(): FeatureLockState {
  const { church } = useAuth();
  const locked = Boolean(church?.featuresLocked);

  return {
    locked,
    reason: locked ? FEATURE_LOCKED_REASON : null,
    trialDaysRemaining: church?.trialDaysRemaining ?? null,
    subscriptionStatus: church?.subscriptionStatus ?? null,
    trialEndsAt: church?.trialEndsAt ?? null,
  };
}
