import { apiClient } from "./client";

export type ConnectOnboardingStatus =
  | "none"
  | "created"
  | "onboarding"
  | "verifying"
  | "active"
  | "restricted"
  | "rejected";

export type ConnectCapabilityStatus = "inactive" | "pending" | "active";

export interface ConnectCapabilities {
  pix: ConnectCapabilityStatus;
  card: ConnectCapabilityStatus;
  boleto: ConnectCapabilityStatus;
}

export interface ConnectStatus {
  hasAccount: boolean;
  canReceivePayments: boolean;
  onboardingStatus: ConnectOnboardingStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  capabilities: ConnectCapabilities;
  requirementsDue: string[];
  disabledReason: string | null;
  lastSyncedAt: string | null;
}

export type FiscalDocumentType = "cnpj" | "cpf";

export interface FiscalProfile {
  documentType: FiscalDocumentType;
  documentNumber: string;
  legalName: string;
  responsibleName: string;
  responsibleDocument: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  updatedAt: string;
}

export interface UpsertFiscalProfileInput {
  documentType: FiscalDocumentType;
  documentNumber: string;
  legalName: string;
  responsibleName: string;
  responsibleDocument?: string | null;
}

export interface ConnectLinkResponse {
  url: string;
}

export interface GivingFund {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  canDelete: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGivingFundInput {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateGivingFundInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

function toFiscalPayload(
  input: UpsertFiscalProfileInput,
): Record<string, string> {
  const payload: Record<string, string> = {
    documentType: input.documentType,
    documentNumber: input.documentNumber,
    legalName: input.legalName,
    responsibleName: input.responsibleName,
  };

  if (
    typeof input.responsibleDocument === "string" &&
    input.responsibleDocument.trim()
  ) {
    payload.responsibleDocument = input.responsibleDocument.trim();
  }

  return payload;
}

export async function fetchFiscalProfile(
  churchId: string,
): Promise<FiscalProfile | null> {
  const result = await apiClient<FiscalProfile | null | undefined>(
    `/churches/${churchId}/payments/fiscal-profile`,
    { churchId },
  );

  return result ?? null;
}

export async function upsertFiscalProfile(
  churchId: string,
  input: UpsertFiscalProfileInput,
): Promise<FiscalProfile> {
  return apiClient<FiscalProfile>(
    `/churches/${churchId}/payments/fiscal-profile`,
    {
      method: "PUT",
      body: JSON.stringify(toFiscalPayload(input)),
      churchId,
    },
  );
}

export async function fetchConnectStatus(
  churchId: string,
): Promise<ConnectStatus> {
  return apiClient<ConnectStatus>(
    `/churches/${churchId}/payments/connect/status`,
    { churchId },
  );
}

export async function startConnectOnboarding(
  churchId: string,
): Promise<ConnectLinkResponse> {
  return apiClient<ConnectLinkResponse>(
    `/churches/${churchId}/payments/connect/account`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export async function resumeConnectOnboarding(
  churchId: string,
): Promise<ConnectLinkResponse> {
  return apiClient<ConnectLinkResponse>(
    `/churches/${churchId}/payments/connect/account-link`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export async function syncConnectAccount(
  churchId: string,
): Promise<ConnectStatus> {
  return apiClient<ConnectStatus>(
    `/churches/${churchId}/payments/connect/sync`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export async function fetchGivingFunds(
  churchId: string,
  options?: { includeInactive?: boolean },
): Promise<GivingFund[]> {
  const params = options?.includeInactive ? "?includeInactive=true" : "";
  return apiClient<GivingFund[]>(
    `/churches/${churchId}/payments/funds${params}`,
    { churchId },
  );
}

export async function createGivingFund(
  churchId: string,
  input: CreateGivingFundInput,
): Promise<GivingFund> {
  return apiClient<GivingFund>(`/churches/${churchId}/payments/funds`, {
    method: "POST",
    body: JSON.stringify(input),
    churchId,
  });
}

export async function updateGivingFund(
  churchId: string,
  fundId: string,
  input: UpdateGivingFundInput,
): Promise<GivingFund> {
  return apiClient<GivingFund>(
    `/churches/${churchId}/payments/funds/${fundId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
      churchId,
    },
  );
}

export async function deleteGivingFund(
  churchId: string,
  fundId: string,
): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>(
    `/churches/${churchId}/payments/funds/${fundId}`,
    {
      method: "DELETE",
      churchId,
    },
  );
}

export interface PublicGivingFund {
  churchName: string;
  churchSlug: string;
  fundName: string;
  fundSlug: string;
  fundDescription: string | null;
  currency: "brl";
  minAmountCents: number;
  maxAmountCents: number;
}

export interface CreateGivingCheckoutInput {
  amountCents: number;
  payerName?: string;
  payerEmail?: string;
}

export interface GivingCheckoutSession {
  donationId: string;
  clientSecret: string;
  stripeAccountId: string;
  publishableKey: string;
  amountCents: number;
  currency: "brl";
}

export async function fetchPublicGivingFund(
  churchSlug: string,
  fundSlug: string,
): Promise<PublicGivingFund> {
  return apiClient<PublicGivingFund>(
    `/public/giving/${encodeURIComponent(churchSlug)}/${encodeURIComponent(fundSlug)}`,
    { skipAuth: true },
  );
}

export async function createGivingCheckout(
  churchSlug: string,
  fundSlug: string,
  input: CreateGivingCheckoutInput,
): Promise<GivingCheckoutSession> {
  return apiClient<GivingCheckoutSession>(
    `/public/giving/${encodeURIComponent(churchSlug)}/${encodeURIComponent(fundSlug)}/checkout`,
    {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    },
  );
}

export interface GivingDonation {
  id: string;
  fundId: string;
  fundName: string;
  amountCents: number;
  currency: string;
  status: string;
  payerName: string | null;
  payerEmail: string | null;
  createdAt: string;
}

export async function fetchGivingDonations(
  churchId: string,
): Promise<GivingDonation[]> {
  return apiClient<GivingDonation[]>(
    `/churches/${churchId}/payments/donations`,
    { churchId },
  );
}
