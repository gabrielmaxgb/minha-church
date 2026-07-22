"use client";

import { useState } from "react";

import { createCheckoutSession } from "@/lib/api/billing";
import { toastApiError } from "@/lib/ui/toast";
import type { BillingPeriod } from "@/types";
import { useAuth } from "@/providers/auth-provider";

export function useSubscribeCheckout() {
  const { church, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const canSubscribe = Boolean(user?.isOwner && church?.id);

  async function subscribe(interval: BillingPeriod = "monthly") {
    if (!church?.id) {
      return;
    }

    setLoading(true);

    try {
      const { url } = await createCheckoutSession(church.id, interval);
      window.location.assign(url);
    } catch (err) {
      toastApiError(err, "Não foi possível abrir o checkout. Tente novamente.");
      setLoading(false);
    }
  }

  return {
    subscribe,
    loading,
    canSubscribe,
    church,
  };
}
