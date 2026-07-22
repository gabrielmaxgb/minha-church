"use client";

import { useState } from "react";

import { createPortalSession } from "@/lib/api/billing";
import { toastApiError } from "@/lib/ui/toast";
import { useAuth } from "@/providers/auth-provider";

export function useBillingPortalAction() {
  const { church } = useAuth();
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    if (!church?.id) {
      return;
    }

    setLoading(true);

    try {
      const { url } = await createPortalSession(church.id);
      window.location.assign(url);
    } catch (err) {
      toastApiError(
        err,
        "Não foi possível abrir a gestão de assinatura. Tente novamente.",
      );
      setLoading(false);
    }
  }

  return {
    openPortal,
    loading,
    canOpenPortal: Boolean(church?.id),
  };
}
