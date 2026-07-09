"use client";

import { useAuth } from "@/providers/auth-provider";
import type { SubscriptionStatus } from "@/types/auth";

export const FEATURE_LOCKED_REASON =
  "Seu período de teste terminou. Assine um plano para criar novos ministérios, atividades e escalas. O cadastro de membros continua liberado.";

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
