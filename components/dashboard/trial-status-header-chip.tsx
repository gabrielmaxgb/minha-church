"use client";

import { Sparkles } from "lucide-react";

import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { useAuth } from "@/providers/auth-provider";

import { URGENT_TRIAL_THRESHOLD_DAYS } from "./trial-status-shared";

/**
 * Chip compacto no topbar — trial calmo (>7 dias). Sempre visível.
 * Estados urgentes/bloqueados continuam no banner grande.
 */
export function TrialStatusHeaderChip() {
  const { user } = useAuth();
  const { locked, subscriptionStatus, trialDaysRemaining } = useFeatureLock();

  if (!user?.isOwner || locked) {
    return null;
  }

  const isCalmTrial =
    subscriptionStatus === "trialing" &&
    trialDaysRemaining !== null &&
    trialDaysRemaining > URGENT_TRIAL_THRESHOLD_DAYS;

  if (!isCalmTrial) {
    return null;
  }

  const dayLabel = trialDaysRemaining === 1 ? "dia" : "dias";

  return (
    <div className="inline-flex h-9 max-w-[9.5rem] items-center gap-1 rounded-lg bg-[#1a1a18] pl-1.5 pr-1 sm:max-w-none sm:gap-1.5 sm:pl-2.5">
      <Sparkles
        className="size-3.5 shrink-0 text-[#f4f4f1]/80"
        aria-hidden
      />
      <span className="hidden truncate text-xs font-medium text-[#f4f4f1]/90 sm:inline">
        Teste · {trialDaysRemaining} {dayLabel}
      </span>
      <SubscribePricingTrigger
        inverted
        size="sm"
        className="h-7 min-w-0 shrink-0 px-2 text-xs shadow-none sm:px-2.5"
      >
        Assinar
      </SubscribePricingTrigger>
    </div>
  );
}
