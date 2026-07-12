import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  fetchConnectStatus,
  fetchFiscalProfile,
  fetchGivingDonations,
  fetchGivingFunds,
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
  givingFunds: (churchId: string) => ({
    queryKey: [churchId, "giving-funds"],
    queryFn: () => fetchGivingFunds(churchId, { includeInactive: true }),
  }),
  givingDonations: (churchId: string) => ({
    queryKey: [churchId, "giving-donations"],
    queryFn: () => fetchGivingDonations(churchId),
  }),
});
