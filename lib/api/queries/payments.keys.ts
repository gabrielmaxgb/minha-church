import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  fetchConnectStatus,
  fetchFiscalProfile,
  fetchFinanceEntries,
  fetchFinanceEntriesSummary,
  fetchGivingDonations,
  fetchGivingFunds,
  fetchMemberGivingFunds,
  fetchMyGivingDonations,
  fetchMyGivingSubscriptions,
  fetchGivingSubscriptions,
  fetchPaymentsSummary,
  type FetchFinanceEntriesParams,
  type FetchGivingDonationsParams,
} from "@/lib/api/payments";

export const paymentsKeys = createQueryKeys("payments", {
  connectStatus: (churchId: string) => ({
    queryKey: [churchId, "connect-status"],
    queryFn: () => fetchConnectStatus(churchId),
  }),
  fiscalProfile: (churchId: string) => ({
    queryKey: [churchId, "fiscal-profile"],
    queryFn: () => fetchFiscalProfile(churchId),
  }),
  paymentsSummary: (churchId: string) => ({
    queryKey: [churchId, "payments-summary"],
    queryFn: () => fetchPaymentsSummary(churchId),
  }),
  givingFunds: (churchId: string) => ({
    queryKey: [churchId, "giving-funds"],
    queryFn: () => fetchGivingFunds(churchId, { includeInactive: true }),
  }),
  memberGivingFunds: (churchId: string) => ({
    queryKey: [churchId, "member-giving-funds"],
    queryFn: () => fetchMemberGivingFunds(churchId),
  }),
  givingDonations: (
    churchId: string,
    params: FetchGivingDonationsParams = {},
  ) => ({
    queryKey: [churchId, "giving-donations", params],
    queryFn: () => fetchGivingDonations(churchId, params),
  }),
  myGivingDonations: (churchId: string) => ({
    queryKey: [churchId, "my-giving-donations"],
    queryFn: () => fetchMyGivingDonations(churchId),
  }),
  myGivingSubscriptions: (churchId: string) => ({
    queryKey: [churchId, "my-giving-subscriptions"],
    queryFn: () => fetchMyGivingSubscriptions(churchId),
  }),
  givingSubscriptions: (
    churchId: string,
    params: { fundId?: string; status?: string } = {},
  ) => ({
    queryKey: [churchId, "giving-subscriptions", params],
    queryFn: () => fetchGivingSubscriptions(churchId, params),
  }),
  financeEntries: (
    churchId: string,
    params: FetchFinanceEntriesParams = {},
  ) => ({
    queryKey: [churchId, "finance-entries", params],
    queryFn: () => fetchFinanceEntries(churchId, params),
  }),
  financeEntriesSummary: (
    churchId: string,
    params: { from?: string; to?: string } = {},
  ) => ({
    queryKey: [churchId, "finance-entries-summary", params],
    queryFn: () => fetchFinanceEntriesSummary(churchId, params),
  }),
});
