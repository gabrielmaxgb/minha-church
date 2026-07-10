"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  confirmTierCrossing,
  fetchTierCrossingPreview,
  requestTierCrossing,
  type TierCrossingPreview,
} from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { billingKeys } from "@/lib/api/queries/billing.keys";
import { useAuth } from "@/providers/auth-provider";

export function countsTowardBillingTier(status: string): boolean {
  return status === "active";
}

export type TierCrossingModalMode = "owner-confirm" | "request-owner";

export function useTierCrossingGate() {
  const { church, user } = useAuth();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<TierCrossingPreview | null>(null);
  const [mode, setMode] = useState<TierCrossingModalMode>("owner-confirm");
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const isOwner = Boolean(user?.isOwner);

  const close = useCallback(() => {
    setPreview(null);
    setPendingAction(null);
    setError(null);
    setLoading(false);
    setRequestSent(false);
    setMode("owner-confirm");
  }, []);

  const runWithTierCrossingCheck = useCallback(
    async (
      memberStatus: string,
      action: () => Promise<void>,
      options?: { projectedMemberCount?: number },
    ): Promise<void> => {
      if (!church?.id || !countsTowardBillingTier(memberStatus)) {
        await action();
        return;
      }

      const projectedMemberCount =
        options?.projectedMemberCount ?? (church.memberCount ?? 0) + 1;

      try {
        const crossingPreview = await fetchTierCrossingPreview(
          church.id,
          projectedMemberCount,
        );

        if (
          !crossingPreview.crossesTier ||
          !crossingPreview.requiresConfirmation
        ) {
          await action();
          return;
        }

        setPreview(crossingPreview);
        setMode(isOwner ? "owner-confirm" : "request-owner");
        setRequestSent(false);
        setPendingAction(() => action);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Não foi possível verificar a faixa de cobrança.";
        throw new Error(message);
      }
    },
    [church?.id, church?.memberCount, isOwner],
  );

  const confirm = useCallback(async () => {
    if (!church?.id || !preview || !pendingAction) {
      return;
    }

    if (!isOwner) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmTierCrossing(church.id, preview.projectedTierId);
      await pendingAction();
      close();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível confirmar a mudança de faixa.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [church?.id, close, isOwner, pendingAction, preview]);

  const requestOwnerApproval = useCallback(async () => {
    if (!church?.id || !preview) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await requestTierCrossing(church.id, preview.projectedTierId);
      setRequestSent(true);
      setPendingAction(null);
      await queryClient.invalidateQueries({ queryKey: billingKeys._def });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar o pedido ao proprietário.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [church?.id, preview, queryClient]);

  return {
    preview,
    mode,
    loading,
    error,
    requestSent,
    isOwner,
    runWithTierCrossingCheck,
    confirm,
    requestOwnerApproval,
    close,
  };
}
