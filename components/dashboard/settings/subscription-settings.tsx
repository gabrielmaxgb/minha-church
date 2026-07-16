"use client";

import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pricing as pricingFallback } from "@/constants/pricing";
import { usePricing, useSubscriptionSummary } from "@/lib/api/queries";
import { useBillingPortalAction } from "@/lib/billing/use-billing-portal";
import { suggestTierByMemberCount } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

import {
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";
import { SubscriptionInvoicesSection } from "./subscription-invoices";

function formatPeriodEnd(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

function isCancelScheduled(data: {
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
}): boolean {
  return (
    data.cancelAtPeriodEnd ||
    (data.subscriptionStatus === "active" && Boolean(data.canceledAt))
  );
}

function resolveStatusLabel(data: {
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
}): string {
  if (isCancelScheduled(data) && data.subscriptionStatus === "active") {
    return "Cancelamento agendado";
  }

  switch (data.subscriptionStatus) {
    case "trialing":
      return "Período de teste";
    case "active":
      return "Assinatura ativa";
    case "past_due":
      return "Pagamento pendente";
    case "canceled":
      return "Assinatura encerrada";
    default:
      return "Status da assinatura";
  }
}

function resolveStatusVariant(data: {
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
}): "default" | "secondary" | "outline" {
  if (isCancelScheduled(data) && data.subscriptionStatus === "active") {
    return "secondary";
  }

  switch (data.subscriptionStatus) {
    case "active":
      return "default";
    case "trialing":
      return "secondary";
    default:
      return "outline";
  }
}

function resolveStatusBadgeClass(data: {
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
}): string | undefined {
  if (isCancelScheduled(data) && data.subscriptionStatus === "active") {
    return "border-billing-border bg-billing-subtle text-billing-foreground";
  }

  if (data.subscriptionStatus === "past_due") {
    return "border-billing/40 bg-billing-mark text-billing-foreground";
  }

  if (data.subscriptionStatus === "trialing") {
    return "border-billing-border bg-billing-subtle text-billing-foreground";
  }

  return undefined;
}

function intervalLabel(interval: string | null): string {
  if (interval === "yearly") {
    return "Anual";
  }

  if (interval === "monthly") {
    return "Mensal";
  }

  return "—";
}

export function SubscriptionSettings() {
  const { user, reloadSession } = useAuth();
  const { data, isPending, isError, refetch } = useSubscriptionSummary();
  const { data: pricingData } = usePricing();
  const { openPortal, loading: portalLoading, error: portalError } =
    useBillingPortalAction();

  useEffect(() => {
    if (!data) {
      return;
    }

    void reloadSession();
  }, [
    data?.cancelAtPeriodEnd,
    data?.canceledAt,
    data?.currentPeriodEnd,
    data?.subscriptionStatus,
    reloadSession,
  ]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  if (!user?.isOwner) {
    return null;
  }

  const tiers = pricingData?.tiers ?? pricingFallback.tiers;
  const tier = data
    ? tiers.find((item) => item.id === data.tierId) ??
      suggestTierByMemberCount(data.memberCount, tiers)
    : null;

  const monthlyPrice = tier?.monthlyPrice ?? 0;
  const yearlyPrice = tier?.yearlyPrice ?? 0;
  const displayPrice =
    data?.interval === "yearly" ? yearlyPrice : monthlyPrice;
  const priceSuffix = data?.interval === "yearly" ? "/ ano" : "/ mês";

  return (
    <div>
      <SettingsSectionHeader
        title="Assinatura"
        description="Plano da igreja, cobrança e forma de pagamento."
      />

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando assinatura...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm">
          <p>Não foi possível carregar os dados da assinatura.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {isCancelScheduled(data) && data.subscriptionStatus === "active" && (
            <div className="relative overflow-hidden rounded-2xl border border-billing-border bg-gradient-to-br from-billing-subtle to-card px-4 py-3.5 text-sm shadow-xs ring-1 ring-billing/15">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-billing"
                aria-hidden
              />
              <p className="pl-2 text-[11px] font-semibold uppercase tracking-wider text-billing-foreground">
                Assinatura
              </p>
              <p className="mt-1 pl-2 font-medium text-foreground">
                Cancelamento solicitado
              </p>
              <p className="mt-1 pl-2 text-muted-foreground">
                {data.currentPeriodEnd
                  ? `Seu acesso continua até ${formatPeriodEnd(data.currentPeriodEnd)}. Depois disso a assinatura será encerrada e não haverá novas cobranças.`
                  : "Seu acesso continua até o fim do período já pago. Depois disso a assinatura será encerrada."}
              </p>
              <p className="mt-2 pl-2 text-muted-foreground">
                Mudou de ideia? Abra{" "}
                <span className="font-medium text-foreground">
                  Gerenciar assinatura
                </span>{" "}
                para reativar no Stripe.
              </p>
            </div>
          )}

          {data.subscriptionStatus === "past_due" && (
            <div className="relative overflow-hidden rounded-2xl border border-billing-border bg-gradient-to-br from-billing-mark to-billing-subtle px-4 py-3.5 text-sm shadow-xs ring-1 ring-billing/25">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-billing"
                aria-hidden
              />
              <p className="pl-2 text-[11px] font-semibold uppercase tracking-wider text-billing-foreground">
                Assinatura
              </p>
              <p className="mt-1 pl-2 font-medium text-foreground">
                Não conseguimos processar o último pagamento
              </p>
              <p className="mt-1 pl-2 text-muted-foreground">
                Atualize o cartão ou regularize a fatura para liberar a edição
                no painel.
              </p>
            </div>
          )}

          <SettingsPanel>
            <div className="border-b border-border/70 px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium">Situação atual</h3>
                <Badge
                  variant={resolveStatusVariant(data)}
                  className={resolveStatusBadgeClass(data)}
                >
                  {resolveStatusLabel(data)}
                </Badge>
              </div>
              {isCancelScheduled(data) &&
                data.subscriptionStatus === "active" &&
                data.currentPeriodEnd && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Acesso até {formatPeriodEnd(data.currentPeriodEnd)}.
                  </p>
                )}
              {data.subscriptionStatus === "trialing" &&
                data.trialDaysRemaining !== null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.trialDaysRemaining === 0
                      ? "O teste gratuito termina hoje."
                      : `Faltam ${data.trialDaysRemaining} dia${data.trialDaysRemaining === 1 ? "" : "s"} de teste.`}
                  </p>
                )}
            </div>

            <div className="divide-y divide-border/50 px-5 py-2">
              <SettingsReadOnlyRow
                label="Faixa sugerida"
                value={tier?.name ?? "—"}
              />
              <SettingsReadOnlyRow
                label="Membros cadastrados"
                value={data.memberCount.toString()}
              />
              {tier && (
                <SettingsReadOnlyRow
                  label="Faixa de membros"
                  value={tier.memberRange}
                />
              )}
              {data.hasActiveSubscription && (
                <>
                  <SettingsReadOnlyRow
                    label="Periodicidade"
                    value={intervalLabel(data.interval)}
                  />
                  <SettingsReadOnlyRow
                    label="Valor da faixa"
                    value={
                      displayPrice > 0
                        ? `${formatCurrency(displayPrice)}${priceSuffix}`
                        : "—"
                    }
                  />
                  {isCancelScheduled(data) && data.currentPeriodEnd && (
                    <SettingsReadOnlyRow
                      label="Encerra em"
                      value={formatPeriodEnd(data.currentPeriodEnd)}
                    />
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border/70 px-5 py-4 sm:flex-row sm:flex-wrap">
              {(data.subscriptionStatus === "trialing" ||
                data.subscriptionStatus === "canceled" ||
                (data.featuresLocked &&
                  data.subscriptionStatus !== "past_due")) && (
                <SubscribePricingTrigger className="w-full sm:w-auto">
                  Assinar agora
                </SubscribePricingTrigger>
              )}

              {(data.subscriptionStatus === "active" ||
                data.subscriptionStatus === "past_due") &&
                data.canManageBilling && (
                  <Button
                    type="button"
                    variant={
                      data.subscriptionStatus === "past_due"
                        ? "default"
                        : "outline"
                    }
                    className="w-full gap-2 sm:w-auto"
                    disabled={portalLoading}
                    onClick={() => void openPortal()}
                  >
                    {portalLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CreditCard className="size-4" />
                    )}
                    {data.subscriptionStatus === "past_due"
                      ? "Atualizar pagamento"
                      : isCancelScheduled(data)
                        ? "Gerenciar no Stripe"
                        : "Gerenciar assinatura"}
                    <ExternalLink className="size-3.5 opacity-60" />
                  </Button>
                )}
            </div>
          </SettingsPanel>

          {portalError && (
            <p className="text-sm text-destructive">{portalError}</p>
          )}

          <SubscriptionInvoicesSection
            enabled={
              data.hasActiveSubscription ||
              data.subscriptionStatus === "past_due" ||
              data.subscriptionStatus === "canceled"
            }
          />

          <p className="text-xs text-muted-foreground">
            A gestão de cartão e cancelamento é feita com segurança pelo Stripe.
            Você volta para esta página após concluir.
          </p>
        </div>
      )}
    </div>
  );
}

function SettingsReadOnlyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}
