"use client";

import { useEffect, useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, TrendingUp, X } from "lucide-react";

import { BusyOverlay } from "@/components/ui/busy-overlay";
import { Button } from "@/components/ui/button";
import {
  approveTierCrossing,
  dismissTierCrossing,
  type TierCrossingRequest,
} from "@/lib/api/billing";
import { billingKeys } from "@/lib/api/queries/billing.keys";
import { toastApiError } from "@/lib/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { useAuth, useTenant } from "@/providers/auth-provider";

export const TIER_UPGRADE_OPEN_EVENT = "minhachurch:open-tier-upgrade";

export function openTierUpgradeApprovalModal() {
  window.dispatchEvent(new CustomEvent(TIER_UPGRADE_OPEN_EVENT));
}

function OwnerApprovalDialog({
  request,
  loading,
  onApprove,
  onDismiss,
  onClose,
}: {
  request: TierCrossingRequest;
  loading: boolean;
  onApprove: () => void;
  onDismiss: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const intervalLabel = request.interval === "yearly" ? "ano" : "mês";
  const priceSuffix = ` / ${intervalLabel}`;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar pedido de faixa"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-border bg-background shadow-popover sm:rounded-xl"
      >
        <BusyOverlay
          active={loading}
          icon={TrendingUp}
          steps={["Atualizando a autorização da faixa..."]}
        />
        <header className="flex items-start gap-4 px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-attention-mark text-attention-foreground">
            <TrendingUp className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id={titleId}
              className="text-xl font-semibold tracking-tight"
            >
              Autorizar nova faixa
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
              {request.requestedByName
                ? `${request.requestedByName} pediu liberar a próxima faixa para continuar adicionando membros ativos.`
                : "Há um pedido para liberar a próxima faixa de cobrança."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-4 px-6 pb-6">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Faixa atual
                </p>
                <p className="mt-1 font-medium">{request.currentTierName}</p>
                <p className="text-xs text-muted-foreground">
                  {request.currentTierMemberRange}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nova faixa
                </p>
                <p className="mt-1 font-medium">{request.projectedTierName}</p>
                <p className="text-xs text-muted-foreground">
                  {request.projectedTierMemberRange}
                </p>
              </div>
            </div>
          </div>

          {request.currentPrice != null && request.projectedPrice != null && (
            <div className="rounded-xl border border-attention-border bg-attention-subtle px-4 py-3 text-sm">
              <p className="font-medium text-foreground">
                {formatCurrency(request.currentPrice)}
                {priceSuffix} → {formatCurrency(request.projectedPrice)}
                {priceSuffix}
              </p>
              <p className="mt-1 text-muted-foreground">
                A cobrança só sobe quando um membro ativo a mais for cadastrado
                após a autorização.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onDismiss}
              disabled={loading}
            >
              Recusar
            </Button>
            <Button type="button" onClick={onApprove} disabled={loading}>
              {loading ? "Autorizando..." : "Autorizar faixa"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TierCrossingOwnerHost() {
  const { churchId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = Boolean(user?.isOwner);
  const [open, setOpen] = useState(false);
  const [autoPrompted, setAutoPrompted] = useState(false);

  const pendingQuery = useQuery({
    ...billingKeys.tierCrossingPending(churchId ?? "unknown"),
    enabled: Boolean(churchId) && isOwner,
    refetchInterval: isOwner ? 60_000 : false,
  });

  const pending = pendingQuery.data ?? null;

  useEffect(() => {
    function handleOpen() {
      if (pending) {
        setOpen(true);
      }
    }

    window.addEventListener(TIER_UPGRADE_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(TIER_UPGRADE_OPEN_EVENT, handleOpen);
  }, [pending]);

  useEffect(() => {
    if (pending && isOwner && !autoPrompted) {
      setOpen(true);
      setAutoPrompted(true);
    }

    if (!pending) {
      setAutoPrompted(false);
      setOpen(false);
    }
  }, [pending, isOwner, autoPrompted]);

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!churchId || !pending) {
        throw new Error("Pedido inválido.");
      }

      return approveTierCrossing(churchId, pending.targetTierId);
    },
    onSuccess: async () => {
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: billingKeys._def });
    },
    onError: (err) => {
      toastApiError(err, "Não foi possível autorizar a faixa.");
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      if (!churchId || !pending) {
        throw new Error("Pedido inválido.");
      }

      return dismissTierCrossing(churchId, pending.targetTierId);
    },
    onSuccess: async () => {
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: billingKeys._def });
    },
    onError: (err) => {
      toastApiError(err, "Não foi possível recusar o pedido.");
    },
  });

  if (!isOwner || !pending || !open) {
    return null;
  }

  const loading = approveMutation.isPending || dismissMutation.isPending;

  return (
    <OwnerApprovalDialog
      request={pending}
      loading={loading}
      onApprove={() => {
        approveMutation.mutate();
      }}
      onDismiss={() => {
        dismissMutation.mutate();
      }}
      onClose={() => setOpen(false)}
    />
  );
}
