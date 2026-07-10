"use client";

import { useEffect, useId } from "react";
import { ArrowRight, TrendingUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TierCrossingPreview } from "@/lib/api/billing";
import type { TierCrossingModalMode } from "@/lib/billing/use-tier-crossing-gate";
import { formatCurrency } from "@/lib/utils";

interface TierCrossingModalProps {
  open: boolean;
  preview: TierCrossingPreview;
  mode: TierCrossingModalMode;
  loading?: boolean;
  error?: string | null;
  requestSent?: boolean;
  onConfirm: () => void;
  onRequestOwner: () => void;
  onClose: () => void;
}

export function TierCrossingModal({
  open,
  preview,
  mode,
  loading = false,
  error = null,
  requestSent = false,
  onConfirm,
  onRequestOwner,
  onClose,
}: TierCrossingModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const isOwnerConfirm = mode === "owner-confirm";

  useEffect(() => {
    if (!open) {
      return;
    }

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
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const intervalLabel = preview.interval === "yearly" ? "ano" : "mês";
  const priceSuffix = ` / ${intervalLabel}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Fechar aviso de mudança de faixa"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 flex w-full max-w-lg flex-col rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start gap-4 px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <TrendingUp className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id={titleId}
              className="font-display text-xl font-semibold tracking-tight"
            >
              {isOwnerConfirm
                ? "Mudança de faixa de cobrança"
                : "Autorização do proprietário necessária"}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
              {isOwnerConfirm
                ? "Este cadastro leva a igreja para a próxima faixa de cobrança."
                : "Adicionar ou ativar este membro mudaria a faixa de pagamento da igreja. Somente o proprietário pode autorizar."}
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
                <p className="mt-1 font-medium">{preview.currentTierName}</p>
                <p className="text-xs text-muted-foreground">
                  {preview.currentTierMemberRange}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nova faixa
                </p>
                <p className="mt-1 font-medium">{preview.projectedTierName}</p>
                <p className="text-xs text-muted-foreground">
                  {preview.projectedTierMemberRange}
                </p>
              </div>
            </div>
          </div>

          {isOwnerConfirm && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">
                {formatCurrency(preview.currentPrice)}
                {priceSuffix} → {formatCurrency(preview.projectedPrice)}
                {priceSuffix}
              </p>
              <p className="mt-1 text-muted-foreground">
                {preview.hasActiveSubscription
                  ? "A assinatura será ajustada automaticamente com rateio proporcional ao salvar este cadastro."
                  : "Quando assinar, o valor seguirá a faixa correspondente ao tamanho da igreja."}
              </p>
            </div>
          )}

          {!isOwnerConfirm && !requestSent && (
            <p className="text-sm text-muted-foreground">
              Enviaremos um aviso ao proprietário. Depois que ele autorizar, tente
              novamente esta ação.
            </p>
          )}

          {requestSent && (
            <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">Pedido enviado</p>
              <p className="mt-1 text-muted-foreground">
                O proprietário foi notificado. Quando a faixa for liberada, você
                poderá tentar de novo.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {requestSent ? "Fechar" : "Voltar"}
            </Button>
            {isOwnerConfirm ? (
              <Button type="button" onClick={onConfirm} disabled={loading}>
                {loading ? "Salvando..." : "Entendi e continuar"}
              </Button>
            ) : !requestSent ? (
              <Button
                type="button"
                onClick={onRequestOwner}
                disabled={loading}
              >
                {loading ? "Enviando..." : "Avisar o proprietário"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
