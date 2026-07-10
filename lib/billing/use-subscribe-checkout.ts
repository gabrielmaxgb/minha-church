"use client";

import { useState } from "react";

import { createCheckoutSession } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import type { BillingPeriod } from "@/types";
import { useAuth } from "@/providers/auth-provider";

export function useSubscribeCheckout() {
  const { church, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubscribe = Boolean(user?.isOwner && church?.id);

  async function subscribe(interval: BillingPeriod = "monthly") {
    if (!church?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { url } = await createCheckoutSession(church.id, interval);
      window.location.assign(url);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível abrir o checkout. Tente novamente.";
      setError(message);
      setLoading(false);
    }
  }

  return {
    subscribe,
    loading,
    error,
    canSubscribe,
    church,
  };
}
