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
  confirmNoCnpj?: boolean;
  contactPhone: string;
  city: string;
  state: string;
}

export interface ConnectLinkResponse {
  url: string;
}

export type GivingFundAudience = "members" | "public";

export interface GivingFundPaymentMethods {
  pix: boolean;
  card: boolean;
  boleto: boolean;
}

export interface GivingFund {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  audience: GivingFundAudience;
  paymentMethods: GivingFundPaymentMethods;
  isActive: boolean;
  canDelete: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGivingFundInput {
  name: string;
  description?: string;
  audience: GivingFundAudience;
  allowPix: boolean;
  allowCard: boolean;
  allowBoleto: boolean;
  sortOrder?: number;
}

export interface UpdateGivingFundInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  allowPix?: boolean;
  allowCard?: boolean;
  allowBoleto?: boolean;
  sortOrder?: number;
}

export interface MemberGivingFund {
  id: string;
  name: string;
  description: string | null;
  paymentMethods: GivingFundPaymentMethods;
  currency: "brl";
  minAmountCents: number;
  maxAmountCents: number;
}

export interface PaymentsSummary {
  canReceivePayments: boolean;
  onboardingStatus: ConnectOnboardingStatus | "none";
  activeFundsCount: number;
  memberFundsCount: number;
  publicFundsCount: number;
  succeededDonationsCount: number;
  succeededAmountCentsLast30Days: number;
}

function toFiscalPayload(
  input: UpsertFiscalProfileInput,
): Record<string, string | boolean> {
  const payload: Record<string, string | boolean> = {
    documentType: input.documentType,
    documentNumber: input.documentNumber,
    legalName: input.legalName,
    responsibleName: input.responsibleName,
    contactPhone: input.contactPhone,
    city: input.city,
    state: input.state,
  };

  if (
    typeof input.responsibleDocument === "string" &&
    input.responsibleDocument.trim()
  ) {
    payload.responsibleDocument = input.responsibleDocument.trim();
  }

  if (input.documentType === "cpf") {
    payload.confirmNoCnpj = input.confirmNoCnpj === true;
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

export async function openExpressDashboard(
  churchId: string,
): Promise<ConnectLinkResponse> {
  return apiClient<ConnectLinkResponse>(
    `/churches/${churchId}/payments/connect/dashboard-link`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export type ConnectPayoutStatus =
  | "paid"
  | "pending"
  | "in_transit"
  | "canceled"
  | "failed";

export interface ConnectPayout {
  id: string;
  amountCents: number;
  currency: string;
  status: ConnectPayoutStatus;
  arrivalDate: string;
  createdAt: string;
  method: string;
  description: string | null;
  failureMessage: string | null;
}

export interface ConnectBalanceAmount {
  amountCents: number;
  currency: string;
}

export interface ConnectPayoutsOverview {
  payoutsEnabled: boolean;
  available: ConnectBalanceAmount[];
  pending: ConnectBalanceAmount[];
  payouts: ConnectPayout[];
  hasMore: boolean;
}

export async function fetchConnectPayoutsOverview(
  churchId: string,
  options?: { limit?: number },
): Promise<ConnectPayoutsOverview> {
  const search = new URLSearchParams();
  if (options?.limit) {
    search.set("limit", String(options.limit));
  }
  const qs = search.toString();
  return apiClient<ConnectPayoutsOverview>(
    `/churches/${churchId}/payments/connect/payouts${qs ? `?${qs}` : ""}`,
    { churchId },
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

export async function fetchMemberGivingFunds(
  churchId: string,
): Promise<MemberGivingFund[]> {
  return apiClient<MemberGivingFund[]>(
    `/churches/${churchId}/payments/funds/for-members`,
    { churchId },
  );
}

export async function fetchPaymentsSummary(
  churchId: string,
): Promise<PaymentsSummary> {
  return apiClient<PaymentsSummary>(
    `/churches/${churchId}/payments/summary`,
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

export async function createMemberGivingCheckout(
  churchId: string,
  fundId: string,
  input: { amountCents: number; recurring?: boolean },
): Promise<GivingCheckoutSession> {
  return apiClient<GivingCheckoutSession>(
    `/churches/${churchId}/payments/funds/${fundId}/checkout`,
    {
      method: "POST",
      body: JSON.stringify(input),
      churchId,
    },
  );
}

export async function fetchMyGivingSubscriptions(
  churchId: string,
): Promise<GivingSubscription[]> {
  return apiClient<GivingSubscription[]>(
    `/churches/${churchId}/payments/subscriptions/mine`,
    { churchId },
  );
}

export async function fetchGivingSubscriptions(
  churchId: string,
  params: { fundId?: string; status?: string } = {},
): Promise<GivingSubscription[]> {
  const search = new URLSearchParams();
  if (params.fundId) {
    search.set("fundId", params.fundId);
  }
  if (params.status) {
    search.set("status", params.status);
  }
  const query = search.toString();
  return apiClient<GivingSubscription[]>(
    `/churches/${churchId}/payments/subscriptions${query ? `?${query}` : ""}`,
    { churchId },
  );
}

export async function cancelMyGivingSubscription(
  churchId: string,
  subscriptionId: string,
): Promise<GivingSubscription> {
  return apiClient<GivingSubscription>(
    `/churches/${churchId}/payments/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export async function cancelGivingSubscriptionAsTreasurer(
  churchId: string,
  subscriptionId: string,
): Promise<GivingSubscription> {
  return apiClient<GivingSubscription>(
    `/churches/${churchId}/payments/subscriptions/${subscriptionId}/cancel-as-treasurer`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export async function createEventTicketCheckout(
  churchId: string,
  eventId: string,
): Promise<GivingCheckoutSession> {
  return apiClient<GivingCheckoutSession>(
    `/churches/${churchId}/payments/events/${eventId}/ticket-checkout`,
    {
      method: "POST",
      body: JSON.stringify({}),
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
  paymentMethods: GivingFundPaymentMethods;
  currency: "brl";
  minAmountCents: number;
  maxAmountCents: number;
}

export interface CreateGivingCheckoutInput {
  amountCents: number;
  payerName?: string;
  payerEmail?: string;
  recurring?: boolean;
  /** Se true, não vincula à ficha mesmo logado. */
  anonymous?: boolean;
}

export interface GivingCheckoutSession {
  donationId: string;
  /** Token de recibo (obrigatório para GET público do recibo). */
  receiptToken: string;
  subscriptionId?: string | null;
  mode?: "payment" | "subscription";
  clientSecret: string;
  stripeAccountId: string;
  publishableKey: string;
  amountCents: number;
  currency: "brl";
}

export interface GivingSubscription {
  id: string;
  fundId: string;
  fundName: string;
  amountCents: number;
  currency: string;
  status: string;
  payerName: string | null;
  payerEmail: string | null;
  donorMemberId: string | null;
  donorMemberName: string | null;
  canceledAt: string | null;
  createdAt: string;
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
      // Envia cookie de sessão quando houver — vínculo híbrido à ficha.
      // Continua público: sem cookie o checkout anônimo segue normal.
    },
  );
}

export type GivingDonationOutcome =
  | "succeeded"
  | "processing"
  | "incomplete"
  | "failed";

export interface GivingDonationReceipt {
  donationId: string;
  status: string;
  outcome: GivingDonationOutcome;
  amountCents: number;
  currency: string;
  fundName: string;
}

export async function fetchGivingDonationReceipt(
  donationId: string,
  receiptToken: string,
): Promise<GivingDonationReceipt> {
  const token = encodeURIComponent(receiptToken);
  return apiClient<GivingDonationReceipt>(
    `/public/giving/donations/${encodeURIComponent(donationId)}/receipt?token=${token}`,
    { skipAuth: true },
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
  donorMemberId: string | null;
  donorMemberName: string | null;
  createdAt: string;
}

export interface GivingDonationList {
  items: GivingDonation[];
  page: number;
  limit: number;
  total: number;
}

export interface FetchGivingDonationsParams {
  fundId?: string;
  status?: string;
  memberId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

function toDonationsQuery(params?: FetchGivingDonationsParams): string {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();
  if (params.fundId) search.set("fundId", params.fundId);
  if (params.status) search.set("status", params.status);
  if (params.memberId) search.set("memberId", params.memberId);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchGivingDonations(
  churchId: string,
  params?: FetchGivingDonationsParams,
): Promise<GivingDonationList> {
  return apiClient<GivingDonationList>(
    `/churches/${churchId}/payments/donations${toDonationsQuery(params)}`,
    { churchId },
  );
}

export async function refundGivingDonation(
  churchId: string,
  donationId: string,
): Promise<GivingDonation> {
  return apiClient<GivingDonation>(
    `/churches/${churchId}/payments/donations/${donationId}/refund`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export async function downloadGivingDonationsCsv(
  churchId: string,
  params?: FetchGivingDonationsParams,
): Promise<void> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada.");
  }

  const response = await fetch(
    `${baseURL}/churches/${churchId}/payments/donations/export${toDonationsQuery(params)}`,
    {
      credentials: "include",
      headers: { "X-Church-Id": churchId },
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível exportar as contribuições.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "contribuicoes.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export interface EventTicketPurchase {
  id: string;
  eventId: string;
  eventName: string;
  amountCents: number;
  currency: string;
  status: string;
  buyerName: string | null;
  buyerEmail: string | null;
  memberId: string | null;
  memberName: string | null;
  createdAt: string;
}

export interface EventTicketPurchaseList {
  items: EventTicketPurchase[];
  page: number;
  limit: number;
  total: number;
}

export interface FetchEventTicketPurchasesParams {
  eventId?: string;
  status?: string;
  memberId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

function toEventTicketsQuery(
  params?: FetchEventTicketPurchasesParams,
): string {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();
  if (params.eventId) search.set("eventId", params.eventId);
  if (params.status) search.set("status", params.status);
  if (params.memberId) search.set("memberId", params.memberId);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchEventTicketPurchases(
  churchId: string,
  params?: FetchEventTicketPurchasesParams,
): Promise<EventTicketPurchaseList> {
  return apiClient<EventTicketPurchaseList>(
    `/churches/${churchId}/payments/event-tickets${toEventTicketsQuery(params)}`,
    { churchId },
  );
}

export async function refundEventTicketPurchase(
  churchId: string,
  ticketId: string,
): Promise<EventTicketPurchase> {
  return apiClient<EventTicketPurchase>(
    `/churches/${churchId}/payments/event-tickets/${ticketId}/refund`,
    {
      method: "POST",
      body: JSON.stringify({}),
      churchId,
    },
  );
}

export async function downloadEventTicketPurchasesCsv(
  churchId: string,
  params?: FetchEventTicketPurchasesParams,
): Promise<void> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada.");
  }

  const response = await fetch(
    `${baseURL}/churches/${churchId}/payments/event-tickets/export${toEventTicketsQuery(params)}`,
    {
      credentials: "include",
      headers: { "X-Church-Id": churchId },
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível exportar as inscrições pagas.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "inscricoes-pagas.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function fetchMyGivingDonations(
  churchId: string,
): Promise<GivingDonation[]> {
  return apiClient<GivingDonation[]>(
    `/churches/${churchId}/payments/donations/mine`,
    { churchId },
  );
}

export type FinanceEntryType = "income" | "expense";
export type FinanceEntryMethod = "cash" | "transfer" | "other";

export interface FinanceEntry {
  id: string;
  type: FinanceEntryType;
  amountCents: number;
  currency: string;
  occurredOn: string;
  category: string;
  accountId: string | null;
  accountName: string | null;
  fundId: string | null;
  fundName: string | null;
  method: FinanceEntryMethod;
  note: string | null;
  createdByUserId: string | null;
  createdByUserName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceEntryList {
  items: FinanceEntry[];
  page: number;
  limit: number;
  total: number;
}

export interface FinanceEntriesSummary {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  onlineDonationCents: number;
  /** Presente após o backend passar a agregar inscrições pagas. */
  eventTicketCents?: number;
}

export interface FetchFinanceEntriesParams {
  type?: FinanceEntryType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CreateFinanceEntryInput {
  type: FinanceEntryType;
  amountCents: number;
  occurredOn: string;
  accountId?: string;
  category?: string;
  fundId?: string;
  method?: FinanceEntryMethod;
  note?: string;
}

export interface UpdateFinanceEntryInput {
  type?: FinanceEntryType;
  amountCents?: number;
  occurredOn?: string;
  accountId?: string | null;
  category?: string;
  fundId?: string | null;
  method?: FinanceEntryMethod;
  note?: string | null;
}

function toFinanceEntriesQuery(params?: FetchFinanceEntriesParams): string {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function toFinanceSummaryQuery(params?: { from?: string; to?: string }): string {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchFinanceEntries(
  churchId: string,
  params?: FetchFinanceEntriesParams,
): Promise<FinanceEntryList> {
  return apiClient<FinanceEntryList>(
    `/churches/${churchId}/payments/entries${toFinanceEntriesQuery(params)}`,
    { churchId },
  );
}

export async function fetchFinanceEntriesSummary(
  churchId: string,
  params?: { from?: string; to?: string },
): Promise<FinanceEntriesSummary> {
  return apiClient<FinanceEntriesSummary>(
    `/churches/${churchId}/payments/entries/summary${toFinanceSummaryQuery(params)}`,
    { churchId },
  );
}

export async function createFinanceEntry(
  churchId: string,
  input: CreateFinanceEntryInput,
): Promise<FinanceEntry> {
  return apiClient<FinanceEntry>(`/churches/${churchId}/payments/entries`, {
    method: "POST",
    body: JSON.stringify(input),
    churchId,
  });
}

export async function updateFinanceEntry(
  churchId: string,
  entryId: string,
  input: UpdateFinanceEntryInput,
): Promise<FinanceEntry> {
  return apiClient<FinanceEntry>(
    `/churches/${churchId}/payments/entries/${entryId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
      churchId,
    },
  );
}

export async function deleteFinanceEntry(
  churchId: string,
  entryId: string,
): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>(
    `/churches/${churchId}/payments/entries/${entryId}`,
    {
      method: "DELETE",
      churchId,
    },
  );
}

export async function downloadFinanceEntriesCsv(
  churchId: string,
  params?: FetchFinanceEntriesParams,
): Promise<void> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada.");
  }

  const response = await fetch(
    `${baseURL}/churches/${churchId}/payments/entries/export${toFinanceEntriesQuery(params)}`,
    {
      credentials: "include",
      headers: { "X-Church-Id": churchId },
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível exportar os lançamentos manuais.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "lancamentos-manuais.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
