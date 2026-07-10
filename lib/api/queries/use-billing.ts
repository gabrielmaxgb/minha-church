"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { createPortalSession } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { billingKeys } from "@/lib/api/queries/billing.keys";
import { useAuth } from "@/providers/auth-provider";

export function useSubscriptionSummary() {
  const { church, user } = useAuth();
  const churchId = church?.id;
  const enabled = Boolean(user?.isOwner && churchId);

  return useQuery({
    ...billingKeys.subscription(churchId ?? ""),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useBillingInvoices() {
  const { church, user } = useAuth();
  const churchId = church?.id;
  const enabled = Boolean(user?.isOwner && churchId);

  return useQuery({
    ...billingKeys.invoices(churchId ?? ""),
    enabled,
    staleTime: 60_000,
  });
}

export function useBillingPortal() {
  const { church } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return createPortalSession(church.id);
    },
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });
}

export function resolveBillingPortalError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Não foi possível abrir a gestão de assinatura. Tente novamente.";
}
