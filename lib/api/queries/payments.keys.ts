import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  fetchConnectStatus,
  fetchFiscalProfile,
  fetchGivingDonations,
  fetchGivingFunds,
  fetchMemberGivingFunds,
  fetchMyGivingDonations,
  fetchPaymentsSummary,
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
  givingDonations: (churchId: string) => ({
    queryKey: [churchId, "giving-donations"],
    queryFn: () => fetchGivingDonations(churchId),
  }),
  myGivingDonations: (churchId: string) => ({
    queryKey: [churchId, "my-giving-donations"],
    queryFn: () => fetchMyGivingDonations(churchId),
  }),
});
