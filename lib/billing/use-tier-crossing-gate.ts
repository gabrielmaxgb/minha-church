"use client";

import { useCallback, useState } from "react";

import {
  confirmTierCrossing,
  fetchTierCrossingPreview,
  type TierCrossingPreview,
} from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

function countsTowardBillingTier(status: string): boolean {
  return status === "active" || status === "visitor";
}

export function useTierCrossingGate() {
  const { church, user } = useAuth();
  const [preview, setPreview] = useState<TierCrossingPreview | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setPreview(null);
    setPendingAction(null);
    setError(null);
    setLoading(false);
  }, []);

  const runWithTierCrossingCheck = useCallback(
    async (
      memberStatus: string,
      action: () => Promise<void>,
    ): Promise<void> => {
      if (!church?.id || !countsTowardBillingTier(memberStatus)) {
        await action();
        return;
      }

      const projectedMemberCount = (church.memberCount ?? 0) + 1;

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
        setPendingAction(() => action);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Não foi possível verificar a faixa de cobrança.";
        throw new Error(message);
      }
    },
    [church?.id, church?.memberCount],
  );

  const confirm = useCallback(async () => {
    if (!church?.id || !preview || !pendingAction) {
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
      setLoading(false);
    }
  }, [church?.id, close, pendingAction, preview]);

  return {
    preview,
    loading,
    error,
    isOwner: Boolean(user?.isOwner),
    runWithTierCrossingCheck,
    confirm,
    close,
  };
}
