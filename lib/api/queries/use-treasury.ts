"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import { paymentsKeys } from "@/lib/api/queries/payments.keys";
import { treasuryKeys } from "@/lib/api/queries/treasury.keys";
import {
  closeFinancialPeriod,
  createFinanceAccount,
  downloadFinancialReportCsv,
  reopenFinancialPeriod,
  updateFinanceAccount,
  type CreateFinanceAccountInput,
  type FinanceAccountKind,
  type UpdateFinanceAccountInput,
} from "@/lib/api/treasury";
import { useAuth } from "@/providers/auth-provider";

function canAccessTreasury(
  user: { isOwner?: boolean } | null | undefined,
  permissions: {
    finances?: { access?: boolean; manage?: boolean };
    reports?: { access?: boolean };
  } | null,
) {
  return Boolean(
    user?.isOwner ||
      permissions?.finances?.access ||
      permissions?.finances?.manage ||
      permissions?.reports?.access,
  );
}

export function useFinanceAccounts(
  params?: { kind?: FinanceAccountKind; includeInactive?: boolean },
  options?: { enabled?: boolean },
) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canAccess = Boolean(
    churchId && canAccessTreasury(user, permissions),
  );
  const enabled = (options?.enabled ?? true) && canAccess;

  return useQuery({
    ...treasuryKeys.accounts(churchId ?? "", params ?? {}),
    enabled,
    staleTime: 30_000,
  });
}

export function useFinancialPeriodStatus(
  year: number,
  month: number,
  options?: { enabled?: boolean },
) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canAccess = Boolean(
    churchId && canAccessTreasury(user, permissions),
  );
  const enabled = (options?.enabled ?? true) && canAccess;

  return useQuery({
    ...treasuryKeys.periodStatus(churchId ?? "", year, month),
    enabled,
    staleTime: 15_000,
  });
}

export function useFinancialReport(
  params: { from?: string; to?: string },
  options?: { enabled?: boolean },
) {
  const { church, permissions, user } = useAuth();
  const churchId = church?.id;
  const canAccess = Boolean(
    churchId && canAccessTreasury(user, permissions),
  );
  const enabled =
    (options?.enabled ?? true) &&
    canAccess &&
    Boolean(params.from && params.to);

  return useQuery({
    ...treasuryKeys.report(churchId ?? "", params),
    enabled,
    staleTime: 15_000,
  });
}

export function useCreateFinanceAccount() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFinanceAccountInput) => {
      if (!church?.id) throw new Error("Igreja não encontrada.");
      return createFinanceAccount(church.id, input);
    },
    onSuccess: () => {
      if (!church?.id) return;
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.accounts._def,
      });
    },
  });
}

export function useUpdateFinanceAccount() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      input,
    }: {
      accountId: string;
      input: UpdateFinanceAccountInput;
    }) => {
      if (!church?.id) throw new Error("Igreja não encontrada.");
      return updateFinanceAccount(church.id, accountId, input);
    },
    onSuccess: () => {
      if (!church?.id) return;
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.accounts._def,
      });
      void queryClient.invalidateQueries({
        queryKey: paymentsKeys.financeEntries._def,
      });
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.report._def,
      });
    },
  });
}

export function useCloseFinancialPeriod() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      year: number;
      month: number;
      note?: string;
    }) => {
      if (!church?.id) throw new Error("Igreja não encontrada.");
      return closeFinancialPeriod(church.id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.periodStatus._def,
      });
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.closedPeriods._def,
      });
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.report._def,
      });
    },
  });
}

export function useReopenFinancialPeriod() {
  const { church } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { year: number; month: number }) => {
      if (!church?.id) throw new Error("Igreja não encontrada.");
      return reopenFinancialPeriod(church.id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.periodStatus._def,
      });
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.closedPeriods._def,
      });
      void queryClient.invalidateQueries({
        queryKey: treasuryKeys.report._def,
      });
    },
  });
}

export function useExportFinancialReport() {
  const { church } = useAuth();

  return useMutation({
    mutationFn: async (params: { from?: string; to?: string }) => {
      if (!church?.id) throw new Error("Igreja não encontrada.");
      await downloadFinancialReportCsv(church.id, params);
    },
  });
}

export function resolveTreasuryError(
  error: unknown,
  fallback = "Não foi possível concluir a ação. Tente novamente.",
): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
