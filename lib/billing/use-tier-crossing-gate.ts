"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  confirmTierCrossing,
  requestTierCrossing,
  tierCrossingPreviewFromErrorDetails,
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
      // Mantido por compatibilidade de assinatura; a checagem agora é feita
      // pelo próprio backend na ação (sem preflight dedicado).
      _options?: { projectedMemberCount?: number },
    ): Promise<void> => {
      if (!church?.id || !countsTowardBillingTier(memberStatus)) {
        await action();
        return;
      }

      try {
        // Otimista: dispara a ação direto. O backend valida a faixa antes de
        // qualquer escrita e, se cruzar sem autorização, responde 409
        // TIER_UPGRADE_REQUIRED (nada é gravado) com o preview no corpo.
        await action();
      } catch (err) {
        if (err instanceof ApiError && err.code === "TIER_UPGRADE_REQUIRED") {
          const crossingPreview = tierCrossingPreviewFromErrorDetails(
            err.details,
          );

          if (crossingPreview) {
            setPreview(crossingPreview);
            setMode(isOwner ? "owner-confirm" : "request-owner");
            setRequestSent(false);
            setPendingAction(() => action);
            return;
          }
        }

        throw err;
      }
    },
    [church?.id, isOwner],
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
