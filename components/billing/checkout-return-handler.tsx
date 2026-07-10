"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CheckoutSuccessModal } from "@/components/billing/checkout-success-modal";
import { pricing as fallbackPricing } from "@/constants/pricing";
import { confirmCheckoutSession } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { usePricing } from "@/lib/api/queries/use-pricing";
import { suggestTierByMemberCount } from "@/lib/pricing";
import { useAuth } from "@/providers/auth-provider";
import type { BillingPeriod, PricingTier } from "@/types";

const RETRY_DELAY_MS = 800;

type CheckoutModalPhase = "confirming" | "success" | "error";

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 0 || error.status >= 502;
  }

  return true;
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Não foi possível confirmar o pagamento. Tente novamente.";
}

function resolveTier(
  tierId: string,
  tiers: readonly PricingTier[],
  memberCount: number,
): PricingTier {
  const list = tiers.length > 0 ? tiers : fallbackPricing.tiers;
  const matched = list.find((tier) => tier.id === tierId);

  if (matched) {
    return matched;
  }

  return suggestTierByMemberCount(memberCount, list);
}

export function CheckoutReturnHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { church, reloadSession } = useAuth();
  const { data: pricingData } = usePricing();

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<CheckoutModalPhase>("confirming");
  const [tier, setTier] = useState<PricingTier | null>(null);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);

  const clearCheckoutParams = useCallback(() => {
    router.replace("/app/dashboard", { scroll: false });
  }, [router]);

  const applySuccess = useCallback(
    (tierId: string, interval: BillingPeriod) => {
      const tiers = pricingData?.tiers ?? fallbackPricing.tiers;
      const memberCount = church?.memberCount ?? 0;

      setTier(resolveTier(tierId, tiers, memberCount));
      setPeriod(interval);
      setErrorMessage(null);
      setPhase("success");
      setOpen(true);
    },
    [church?.memberCount, pricingData?.tiers],
  );

  const runConfirm = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    const churchId = church?.id;

    if (!sessionId || !churchId) {
      return;
    }

    setPhase("confirming");
    setErrorMessage(null);
    setOpen(true);

    try {
      let result;

      try {
        result = await confirmCheckoutSession(churchId, sessionId);
      } catch (firstError) {
        if (!isRetryableError(firstError)) {
          throw firstError;
        }

        await sleep(RETRY_DELAY_MS);
        result = await confirmCheckoutSession(churchId, sessionId);
      }

      await reloadSession();
      applySuccess(result.tierId, result.interval);
    } catch (error) {
      try {
        const session = await reloadSession();
        const activeChurch =
          session.churches.find((item) => item.id === churchId) ??
          session.church;

        if (activeChurch.subscriptionStatus === "active") {
          const tiers = pricingData?.tiers ?? fallbackPricing.tiers;
          const fallbackTier = suggestTierByMemberCount(
            activeChurch.memberCount ?? church?.memberCount ?? 0,
            tiers,
          );

          applySuccess(fallbackTier.id, "monthly");
          return;
        }
      } catch {
        // Mantém fluxo de erro abaixo.
      }

      setPhase("error");
      setErrorMessage(resolveErrorMessage(error));
      setOpen(true);
    }
  }, [
    applySuccess,
    church?.id,
    church?.memberCount,
    pricingData?.tiers,
    reloadSession,
  ]);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    if (searchParams.get("checkout") !== "success") {
      return;
    }

    const sessionId = searchParams.get("session_id");

    if (!sessionId || !church) {
      return;
    }

    startedRef.current = true;
    sessionIdRef.current = sessionId;
    void runConfirm();
  }, [church, runConfirm, searchParams]);

  const handleClose = useCallback(() => {
    setOpen(false);

    if (phase === "success") {
      clearCheckoutParams();
    }
  }, [clearCheckoutParams, phase]);

  const handleRetry = useCallback(() => {
    void runConfirm();
  }, [runConfirm]);

  if (!open || !church) {
    return null;
  }

  return (
    <CheckoutSuccessModal
      open={open}
      phase={phase}
      churchName={church.name}
      tier={tier}
      period={period}
      errorMessage={errorMessage}
      onRetry={handleRetry}
      onClose={handleClose}
    />
  );
}
