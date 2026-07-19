import { apiClient } from "@/lib/api/client";

export type FinanceAccountKind = "income" | "expense";

export interface FinanceAccount {
  id: string;
  name: string;
  kind: FinanceAccountKind;
  systemKey: string | null;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialPeriod {
  id: string;
  year: number;
  month: number;
  closedAt: string;
  closedByUserId: string | null;
  closedByUserName: string | null;
  note: string | null;
}

export interface FinancialPeriodStatus {
  year: number;
  month: number;
  isClosed: boolean;
  period: FinancialPeriod | null;
}

export interface FinancialReportAccountLine {
  accountId: string | null;
  accountName: string;
  kind: FinanceAccountKind;
  systemKey: string | null;
  manualCents: number;
  onlineDonationCents: number;
  eventTicketCents: number;
  totalCents: number;
}

export interface FinancialReport {
  churchId: string;
  churchName: string;
  from: string;
  to: string;
  generatedAt: string;
  summary: {
    manualIncomeCents: number;
    expenseCents: number;
    onlineDonationCents: number;
    eventTicketCents: number;
    totalIncomeCents: number;
    balanceCents: number;
  };
  incomeLines: FinancialReportAccountLine[];
  expenseLines: FinancialReportAccountLine[];
  periods: FinancialPeriodStatus[];
}

export interface CreateFinanceAccountInput {
  name: string;
  kind: FinanceAccountKind;
  sortOrder?: number;
}

export interface UpdateFinanceAccountInput {
  name?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export async function fetchFinanceAccounts(
  churchId: string,
  params?: { kind?: FinanceAccountKind; includeInactive?: boolean },
): Promise<FinanceAccount[]> {
  const search = new URLSearchParams();
  if (params?.kind) search.set("kind", params.kind);
  if (params?.includeInactive) search.set("includeInactive", "1");
  const qs = search.toString();
  return apiClient<FinanceAccount[]>(
    `/churches/${churchId}/treasury/accounts${qs ? `?${qs}` : ""}`,
    { churchId },
  );
}

export async function createFinanceAccount(
  churchId: string,
  input: CreateFinanceAccountInput,
): Promise<FinanceAccount> {
  return apiClient<FinanceAccount>(
    `/churches/${churchId}/treasury/accounts`,
    {
      method: "POST",
      body: JSON.stringify(input),
      churchId,
    },
  );
}

export async function updateFinanceAccount(
  churchId: string,
  accountId: string,
  input: UpdateFinanceAccountInput,
): Promise<FinanceAccount> {
  return apiClient<FinanceAccount>(
    `/churches/${churchId}/treasury/accounts/${accountId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
      churchId,
    },
  );
}

export async function fetchFinancialPeriodStatus(
  churchId: string,
  year: number,
  month: number,
): Promise<FinancialPeriodStatus> {
  const search = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  return apiClient<FinancialPeriodStatus>(
    `/churches/${churchId}/treasury/periods/status?${search}`,
    { churchId },
  );
}

export async function fetchClosedFinancialPeriods(
  churchId: string,
  year?: number,
): Promise<FinancialPeriod[]> {
  const search = new URLSearchParams();
  if (year) search.set("year", String(year));
  const qs = search.toString();
  return apiClient<FinancialPeriod[]>(
    `/churches/${churchId}/treasury/periods${qs ? `?${qs}` : ""}`,
    { churchId },
  );
}

export async function closeFinancialPeriod(
  churchId: string,
  input: { year: number; month: number; note?: string },
): Promise<FinancialPeriod> {
  return apiClient<FinancialPeriod>(
    `/churches/${churchId}/treasury/periods/close`,
    {
      method: "POST",
      body: JSON.stringify(input),
      churchId,
    },
  );
}

export async function reopenFinancialPeriod(
  churchId: string,
  input: { year: number; month: number },
): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>(
    `/churches/${churchId}/treasury/periods/reopen`,
    {
      method: "POST",
      body: JSON.stringify(input),
      churchId,
    },
  );
}

export async function fetchFinancialReport(
  churchId: string,
  params?: { from?: string; to?: string },
): Promise<FinancialReport> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const qs = search.toString();
  return apiClient<FinancialReport>(
    `/churches/${churchId}/treasury/report${qs ? `?${qs}` : ""}`,
    { churchId },
  );
}

export async function downloadFinancialReportCsv(
  churchId: string,
  params?: { from?: string; to?: string },
): Promise<void> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const qs = search.toString();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  const response = await fetch(
    `${baseUrl}/churches/${churchId}/treasury/report/export${qs ? `?${qs}` : ""}`,
    {
      credentials: "include",
      headers: { "X-Church-Id": churchId },
    },
  );
  if (!response.ok) {
    throw new Error("Não foi possível exportar o relatório.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "relatorio-financeiro.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
