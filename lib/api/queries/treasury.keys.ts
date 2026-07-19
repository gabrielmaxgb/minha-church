import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  fetchClosedFinancialPeriods,
  fetchFinanceAccounts,
  fetchFinancialPeriodStatus,
  fetchFinancialReport,
  type FinanceAccountKind,
} from "@/lib/api/treasury";

export const treasuryKeys = createQueryKeys("treasury", {
  accounts: (
    churchId: string,
    params: { kind?: FinanceAccountKind; includeInactive?: boolean } = {},
  ) => ({
    queryKey: [churchId, "finance-accounts", params],
    queryFn: () => fetchFinanceAccounts(churchId, params),
  }),
  periodStatus: (churchId: string, year: number, month: number) => ({
    queryKey: [churchId, "financial-period", year, month],
    queryFn: () => fetchFinancialPeriodStatus(churchId, year, month),
  }),
  closedPeriods: (churchId: string, year?: number) => ({
    queryKey: [churchId, "closed-periods", year ?? "all"],
    queryFn: () => fetchClosedFinancialPeriods(churchId, year),
  }),
  report: (
    churchId: string,
    params: { from?: string; to?: string } = {},
  ) => ({
    queryKey: [churchId, "financial-report", params],
    queryFn: () => fetchFinancialReport(churchId, params),
  }),
});
