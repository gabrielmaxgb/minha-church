"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import {
  createGivingFund,
  createMemberGivingCheckout,
  deleteGivingFund,
  resumeConnectOnboarding,
  startConnectOnboarding,
  syncConnectAccount,
  updateGivingFund,
  upsertFiscalProfile,
  type ConnectStatus,
  type CreateGivingFundInput,
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

export function useGivingDonations(options?: { enabled?: boolean }) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canManage = Boolean(
    churchId && (user?.isOwner || permissions?.finances.manage),
  );
  const enabled = (options?.enabled ?? true) && canManage;

  return useQuery({
    ...paymentsKeys.givingDonations(churchId ?? ""),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
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
    }: {
      fundId: string;
      amountCents: number;
    }) => {
      if (!church?.id) {
        throw new Error("Igreja não encontrada.");
      }

      return createMemberGivingCheckout(church.id, fundId, { amountCents });
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
