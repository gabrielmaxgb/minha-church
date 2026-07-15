"use client";

import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner";
import { SoftOnboardingHost } from "@/components/dashboard/onboarding/soft-onboarding-host";
import { TrialStatusBanner } from "@/components/dashboard/trial-status-banner";
import { URGENT_TRIAL_THRESHOLD_DAYS } from "@/components/dashboard/trial-status-shared";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { useAuth } from "@/providers/auth-provider";

/**
 * Um único slot de banner de sistema no topo do painel.
 * Prioridade: e-mail não confirmado → cobrança/trial urgente → (soft onboarding
 * vai para “Precisa de você”, não disputa este slot).
 */
export function SystemBannersHost() {
  const { user } = useAuth();
  const { locked, subscriptionStatus, trialDaysRemaining } = useFeatureLock();

  const needsEmailVerify =
    Boolean(user?.isOwner) && user?.emailVerified === false;

  const needsTrialBanner =
    Boolean(user?.isOwner) &&
    (subscriptionStatus === "past_due" ||
      locked ||
      (subscriptionStatus === "trialing" &&
        trialDaysRemaining !== null &&
        trialDaysRemaining <= URGENT_TRIAL_THRESHOLD_DAYS));

  return (
    <>
      {needsEmailVerify ? (
        <EmailVerificationBanner />
      ) : needsTrialBanner ? (
        <TrialStatusBanner />
      ) : null}
      {/* Modal soft no 1º acesso; lembrete persistente fica nas prioridades do Início */}
      <SoftOnboardingHost showBanner={false} />
    </>
  );
}
