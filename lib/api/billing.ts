import type { BillingPeriod } from "@/types";

import { apiClient } from "./client";

export interface CheckoutSessionResponse {
  url: string;
}

export interface CheckoutConfirmResponse {
  subscriptionStatus: "trialing" | "active" | "past_due" | "canceled";
  tierId: string;
  interval: BillingPeriod;
}

export interface SubscriptionSummary {
  subscriptionStatus: "trialing" | "active" | "past_due" | "canceled";
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  featuresLocked: boolean;
  tierId: string;
  interval: BillingPeriod | null;
  memberCount: number;
  canManageBilling: boolean;
  hasActiveSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
}

export interface BillingInvoice {
  id: string;
  number: string | null;
  status: string;
  amountPaid: number;
  currency: string;
  createdAt: string;
  periodStart: string | null;
  periodEnd: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

export interface PortalSessionResponse {
  url: string;
}

export interface TierCrossingPreview {
  crossesTier: boolean;
  requiresConfirmation: boolean;
  currentMemberCount: number;
  projectedMemberCount: number;
  currentTierId: string;
  projectedTierId: string;
  currentTierName: string;
  projectedTierName: string;
  currentTierMemberRange: string;
  projectedTierMemberRange: string;
  hasActiveSubscription: boolean;
  interval: BillingPeriod | null;
  currentPrice: number;
  projectedPrice: number;
  priceDelta: number;
}

export async function createCheckoutSession(
  churchId: string,
  interval: BillingPeriod,
): Promise<CheckoutSessionResponse> {
  return apiClient<CheckoutSessionResponse>(
    `/churches/${churchId}/billing/checkout`,
    {
      method: "POST",
      body: JSON.stringify({ interval }),
      churchId,
    },
  );
}

export async function confirmCheckoutSession(
  churchId: string,
  sessionId: string,
): Promise<CheckoutConfirmResponse> {
  const params = new URLSearchParams({ session_id: sessionId });

  return apiClient<CheckoutConfirmResponse>(
    `/churches/${churchId}/billing/checkout/confirm?${params.toString()}`,
    { churchId },
  );
}

export async function fetchSubscriptionSummary(
  churchId: string,
): Promise<SubscriptionSummary> {
  return apiClient<SubscriptionSummary>(
    `/churches/${churchId}/billing/subscription`,
    { churchId },
  );
}

export async function fetchBillingInvoices(
  churchId: string,
): Promise<BillingInvoice[]> {
  return apiClient<BillingInvoice[]>(
    `/churches/${churchId}/billing/invoices`,
    { churchId },
  );
}

export async function createPortalSession(
  churchId: string,
): Promise<PortalSessionResponse> {
  return apiClient<PortalSessionResponse>(
    `/churches/${churchId}/billing/portal`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export async function fetchTierCrossingPreview(
  churchId: string,
  projectedMemberCount: number,
): Promise<TierCrossingPreview> {
  const params = new URLSearchParams({
    projectedMemberCount: String(projectedMemberCount),
  });

  return apiClient<TierCrossingPreview>(
    `/churches/${churchId}/billing/tier-crossing/preview?${params.toString()}`,
    { churchId },
  );
}

export async function confirmTierCrossing(
  churchId: string,
  targetTierId: string,
): Promise<{ acknowledged: boolean; projectedTierId: string }> {
  return apiClient(`/churches/${churchId}/billing/tier-crossing/confirm`, {
    method: "POST",
    body: JSON.stringify({ targetTierId }),
    churchId,
  });
}
