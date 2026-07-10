"use client";

import { useState } from "react";

import { createPortalSession } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

export function useBillingPortalAction() {
  const { church } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    if (!church?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { url } = await createPortalSession(church.id);
      window.location.assign(url);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível abrir a gestão de assinatura. Tente novamente.";
      setError(message);
      setLoading(false);
    }
  }

  return {
    openPortal,
    loading,
    error,
    canOpenPortal: Boolean(church?.id),
  };
}
