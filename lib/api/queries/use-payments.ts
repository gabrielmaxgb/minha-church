"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import {
  cancelGivingSubscriptionAsTreasurer,
  cancelMyGivingSubscription,
  createFinanceEntry,
  createGivingFund,
  createMemberGivingCheckout,
  deleteFinanceEntry,
  deleteGivingFund,
  downloadFinanceEntriesCsv,
  downloadGivingDonationsCsv,
  openExpressDashboard,
  refundGivingDonation,
  resumeConnectOnboarding,
  startConnectOnboarding,
  syncConnectAccount,
  updateFinanceEntry,
  updateGivingFund,
  upsertFiscalProfile,
  type ConnectStatus,
  type CreateFinanceEntryInput,
  type CreateGivingFundInput,
  type FetchFinanceEntriesParams,
  type FetchGivingDonationsParams,
  type UpdateFinanceEntryInput,
  type UpdateGivingFundInput,
  type UpsertFiscalProfileInput,
} from "@/lib/api/payments";
import { paymentsKeys } from "@/lib/api/queries/payments.keys";
import { useAuth } from "@/providers/auth-provider";

export function useConnectStatus(options?: { enabled?: boolean }) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canAccess = Boolean(
    churchId &&
      (user?.isOwner ||
        permissions?.finances.access ||
        permissions?.finances.manage),
  );
  const enabled = (options?.enabled ?? true) && canAccess;

  return useQuery({
    ...paymentsKeys.connectStatus(churchId ?? ""),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useFiscalProfile() {
  const { church, user } = useAuth();
  const churchId = church?.id;
  const enabled = Boolean(user?.isOwner && churchId);

  return useQuery({
    ...paymentsKeys.fiscalProfile(churchId ?? ""),
    enabled,
    staleTime: 30_000,
  });
}

export function usePaymentsSummary(options?: { enabled?: boolean }) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canAccess = Boolean(
    churchId &&
      (user?.isOwner ||
        permissions?.finances.access ||
        permissions?.finances.manage),
  );
  const enabled = (options?.enabled ?? true) && canAccess;

  return useQuery({
    ...paymentsKeys.paymentsSummary(churchId ?? ""),
    enabled,
    staleTime: 15_000,
  });
}

export function useGivingFunds(options?: { enabled?: boolean }) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canManage = Boolean(
    churchId && (user?.isOwner || permissions?.finances.manage),
  );
  const enabled = (options?.enabled ?? true) && canManage;

  return useQuery({
    ...paymentsKeys.givingFunds(churchId ?? ""),
    enabled,
    staleTime: 15_000,
  });
}

export function useMemberGivingFunds(options?: { enabled?: boolean }) {
  const { church } = useAuth();
  const churchId = church?.id;
  const enabled = (options?.enabled ?? true) && Boolean(churchId);

  return useQuery({
    ...paymentsKeys.memberGivingFunds(churchId ?? ""),
    enabled,
    staleTime: 15_000,
    retry: false,
  });
}

export function useGivingDonations(
  params: FetchGivingDonationsParams = {},
  options?: { enabled?: boolean },
) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canAccess = Boolean(
    churchId &&
      (user?.isOwner ||
        permissions?.finances.access ||
        permissions?.finances.manage),
  );
  const enabled = (options?.enabled ?? true) && canAccess;

  return useQuery({
    ...paymentsKeys.givingDonations(churchId ?? "", params),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useRefundGivingDonation() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: string) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return refundGivingDonation(church.id, donationId);
    },
    onSuccess: (donation) => {
      if (!church?.id) {
        return;
      }

      // Prefix da factory: ["payments", "givingDonations", ...]
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.givingDonations._def,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.myGivingDonations(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.paymentsSummary(church.id).queryKey,
      });
      // Otimista: atualiza qualquer lista em cache com o item estornado.
      queryClient.setQueriesData(
        { queryKey: paymentsKeys.givingDonations._def },
        (current: unknown) => {
          if (
            !current ||
            typeof current !== "object" ||
            !("items" in current) ||
            !Array.isArray((current as { items: unknown }).items)
          ) {
            return current;
          }

          const list = current as {
            items: Array<{ id: string; status: string }>;
            page: number;
            limit: number;
            total: number;
          };

          return {
            ...list,
            items: list.items.map((item) =>
              item.id === donation.id ? { ...item, ...donation } : item,
            ),
          };
        },
      );
    },
  });
}

export function useExportGivingDonations() {
  const { church } = useAuth();

  return useMutation({
    mutationFn: async (params: FetchGivingDonationsParams = {}) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      await downloadGivingDonationsCsv(church.id, params);
    },
  });
}

export function useFinanceEntries(
  params: FetchFinanceEntriesParams = {},
  options?: { enabled?: boolean },
) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canAccess = Boolean(
    churchId &&
      (user?.isOwner ||
        permissions?.finances.access ||
        permissions?.finances.manage),
  );
  const enabled = (options?.enabled ?? true) && canAccess;

  return useQuery({
    ...paymentsKeys.financeEntries(churchId ?? "", params),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useFinanceEntriesSummary(
  params: { from?: string; to?: string } = {},
  options?: { enabled?: boolean },
) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canAccess = Boolean(
    churchId &&
      (user?.isOwner ||
        permissions?.finances.access ||
        permissions?.finances.manage),
  );
  const enabled = (options?.enabled ?? true) && canAccess;

  return useQuery({
    ...paymentsKeys.financeEntriesSummary(churchId ?? "", params),
    enabled,
    staleTime: 15_000,
  });
}

export function useCreateFinanceEntry() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFinanceEntryInput) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return createFinanceEntry(church.id, input);
    },
    onSuccess: () => {
      if (!church?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.financeEntries._def,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.financeEntriesSummary._def,
      });
    },
  });
}

export function useUpdateFinanceEntry() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      input,
    }: {
      entryId: string;
      input: UpdateFinanceEntryInput;
    }) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return updateFinanceEntry(church.id, entryId, input);
    },
    onSuccess: () => {
      if (!church?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.financeEntries._def,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.financeEntriesSummary._def,
      });
    },
  });
}

export function useDeleteFinanceEntry() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return deleteFinanceEntry(church.id, entryId);
    },
    onSuccess: () => {
      if (!church?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.financeEntries._def,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.financeEntriesSummary._def,
      });
    },
  });
}

export function useExportFinanceEntries() {
  const { church } = useAuth();

  return useMutation({
    mutationFn: async (params: FetchFinanceEntriesParams = {}) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      await downloadFinanceEntriesCsv(church.id, params);
    },
  });
}

export function useMyGivingDonations(options?: { enabled?: boolean }) {
  const { church } = useAuth();
  const churchId = church?.id;
  const enabled = (options?.enabled ?? true) && Boolean(churchId);

  return useQuery({
    ...paymentsKeys.myGivingDonations(churchId ?? ""),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useMyGivingSubscriptions(options?: { enabled?: boolean }) {
  const { church } = useAuth();
  const churchId = church?.id;
  const enabled = (options?.enabled ?? true) && Boolean(churchId);

  return useQuery({
    ...paymentsKeys.myGivingSubscriptions(churchId ?? ""),
    enabled,
    staleTime: 15_000,
  });
}

export function useCancelMyGivingSubscription() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return cancelMyGivingSubscription(church.id, subscriptionId);
    },
    onSuccess: () => {
      if (!church?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.myGivingSubscriptions(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.myGivingDonations(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: [paymentsKeys._def[0], church.id, "giving-subscriptions"],
      });
    },
  });
}

export function useGivingSubscriptions(
  params: { fundId?: string; status?: string } = {},
  options?: { enabled?: boolean },
) {
  const { church } = useAuth();
  const churchId = church?.id;
  const enabled = (options?.enabled ?? true) && Boolean(churchId);

  return useQuery({
    ...paymentsKeys.givingSubscriptions(churchId ?? "", params),
    enabled,
    staleTime: 15_000,
  });
}

export function useCancelGivingSubscriptionAsTreasurer() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return cancelGivingSubscriptionAsTreasurer(church.id, subscriptionId);
    },
    onSuccess: () => {
      if (!church?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: [paymentsKeys._def[0], church.id, "giving-subscriptions"],
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.myGivingSubscriptions(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: [paymentsKeys._def[0], church.id, "giving-donations"],
      });
    },
  });
}

export function useUpsertFiscalProfile() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertFiscalProfileInput) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return upsertFiscalProfile(church.id, input);
    },
    onSuccess: (profile) => {
      if (!church?.id) {
        return;
      }

      queryClient.setQueryData(
        paymentsKeys.fiscalProfile(church.id).queryKey,
        profile,
      );
    },
  });
}

export function useCreateGivingFund() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGivingFundInput) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return createGivingFund(church.id, input);
    },
    onSuccess: () => {
      if (!church?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.givingFunds(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.memberGivingFunds(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.paymentsSummary(church.id).queryKey,
      });
    },
  });
}

export function useUpdateGivingFund() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fundId,
      input,
    }: {
      fundId: string;
      input: UpdateGivingFundInput;
    }) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return updateGivingFund(church.id, fundId, input);
    },
    onSuccess: () => {
      if (!church?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.givingFunds(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.memberGivingFunds(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.paymentsSummary(church.id).queryKey,
      });
    },
  });
}

export function useDeleteGivingFund() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fundId: string) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return deleteGivingFund(church.id, fundId);
    },
    onSuccess: () => {
      if (!church?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.givingFunds(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.memberGivingFunds(church.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.paymentsSummary(church.id).queryKey,
      });
    },
  });
}

export function useCreateMemberGivingCheckout() {
  const { church } = useAuth();

  return useMutation({
    mutationFn: async ({
      fundId,
      amountCents,
      recurring,
    }: {
      fundId: string;
      amountCents: number;
      recurring?: boolean;
    }) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return createMemberGivingCheckout(church.id, fundId, {
        amountCents,
        recurring,
      });
    },
  });
}

/** Redireciona para o onboarding hospedado do Stripe (Account Link). */
export function useStartConnectOnboarding() {
  const { church } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return startConnectOnboarding(church.id);
    },
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });
}

/** Re-gera o Account Link quando o anterior expirou ou o cadastro ficou incompleto. */
export function useResumeConnectOnboarding() {
  const { church } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return resumeConnectOnboarding(church.id);
    },
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });
}

/** Login link one-shot para o Express Dashboard da conta conectada. */
export function useOpenExpressDashboard() {
  const { church } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return openExpressDashboard(church.id);
    },
    onSuccess: ({ url }) => {
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.assign(url);
      }
    },
  });
}

/** Força sincronização com o Stripe (usado no retorno do onboarding). */
export function useSyncConnectAccount() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return syncConnectAccount(church.id);
    },
    onSuccess: (status: ConnectStatus) => {
      if (!church?.id) {
        return;
      }

      queryClient.setQueryData(
        paymentsKeys.connectStatus(church.id).queryKey,
        status,
      );
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.fiscalProfile(church.id).queryKey,
      });
    },
  });
}

export function resolvePaymentsError(
  error: unknown,
  fallback = "Não foi possível concluir a ação. Tente novamente.",
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}
