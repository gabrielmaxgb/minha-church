"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricing } from "@/lib/api/queries/use-pricing";
import { useSubscribeCheckout } from "@/lib/billing/use-subscribe-checkout";
import {
  formatMemberCountLabel,
  formatPricePerMember,
  getTierBillingComparison,
  getTierMonthlyPrice,
  suggestTierByMemberCount,
} from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";
import type { BillingPeriod, PricingTier } from "@/types";

interface SubscribePricingModalProps {
  open: boolean;
  onClose: () => void;
}

function TierCard({
  tier,
  period,
  isSuggested,
  memberCount,
}: {
  tier: PricingTier;
  period: BillingPeriod;
  isSuggested: boolean;
  memberCount: number;
}) {
  const monthlyPrice = getTierMonthlyPrice(tier, period);
  const pricePerMember = monthlyPrice / tier.memberCountForPricePerMember;
  const { monthsFree, savings } = getTierBillingComparison(tier);

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col shadow-none transition-all",
        isSuggested
          ? "border-foreground bg-foreground text-background ring-2 ring-foreground ring-offset-2 ring-offset-background"
          : "border-border bg-background opacity-80",
      )}
    >
      <CardHeader className="pb-3">
        {isSuggested ? (
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-background/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
            <Sparkles className="size-3" aria-hidden />
            Sua faixa — {formatMemberCountLabel(memberCount)}
          </span>
        ) : null}
        <CardTitle
          className={cn(
            "tracking-tight",
            isSuggested ? "text-xl font-bold" : "text-base font-semibold",
          )}
        >
          {tier.name}
        </CardTitle>
        <CardDescription
          className={cn(
            "text-xs leading-relaxed",
            isSuggested ? "text-background/70" : "text-muted-foreground",
          )}
        >
          {tier.memberRange}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-3xl font-bold tracking-tight">
          {formatCurrency(monthlyPrice)}
          <span
            className={cn(
              "text-base font-normal",
              isSuggested ? "text-background/70" : "text-muted-foreground",
            )}
          >
            /mês
          </span>
        </p>
        {period === "yearly" ? (
          <p
            className={cn(
              "mt-1 text-xs",
              isSuggested ? "text-background/65" : "text-muted-foreground",
            )}
          >
            {formatCurrency(tier.yearlyPrice)} cobrados uma vez por ano ·{" "}
            {monthsFree} meses grátis ({formatCurrency(savings)} de economia)
          </p>
        ) : (
          <p
            className={cn(
              "mt-1 text-xs",
              isSuggested ? "text-background/65" : "text-muted-foreground",
            )}
          >
            Ciclo mensal, cancele quando quiser
          </p>
        )}
        <p
          className={cn(
            "mt-3 text-sm font-medium",
            isSuggested ? "text-background" : "text-foreground",
          )}
        >
          {formatPricePerMember(pricePerMember)} por membro
        </p>
      </CardContent>
    </Card>
  );
}

export function SubscribePricingModal({
  open,
  onClose,
}: SubscribePricingModalProps) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const { data: pricing, isLoading, isError } = usePricing();
  const { subscribe, loading, error, canSubscribe, church } =
    useSubscribeCheckout();

  const memberCount = church?.memberCount ?? 0;

  const suggestedTier = useMemo(() => {
    if (!pricing?.tiers.length) {
      return null;
    }

    return suggestTierByMemberCount(memberCount, pricing.tiers);
  }, [memberCount, pricing?.tiers]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const suggestedPrice =
    suggestedTier !== null
      ? getTierMonthlyPrice(suggestedTier, period)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-pricing-title"
        className="relative z-10 flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-xl border border-border bg-background shadow-popover sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-8 sm:py-6">
          <div className="space-y-2 pr-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assinatura Minha Church
            </p>
            <h2
              id="subscribe-pricing-title"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              O preço certo para o tamanho da sua igreja
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {church?.name ? (
                <>
                  <span className="font-medium text-foreground">
                    {church.name}
                  </span>{" "}
                  tem{" "}
                  <span className="font-medium text-foreground">
                    {formatMemberCountLabel(memberCount)}
                  </span>{" "}
                  cadastrados. Por isso sua faixa é{" "}
                  {suggestedTier ? (
                    <span className="font-medium text-foreground">
                      {suggestedTier.name}
                    </span>
                  ) : (
                    "a indicada abaixo"
                  )}
                  . Você paga conforme o tamanho da congregação — não por pacote
                  de funcionalidades. Tudo continua disponível: membros,
                  ministérios, escalas e comunicados.
                </>
              ) : (
                <>
                  Você paga conforme o tamanho da congregação — não por pacote
                  de funcionalidades. Mesmo sistema completo em todas as faixas.
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex rounded-lg border border-border p-1">
              <button
                type="button"
                onClick={() => setPeriod("monthly")}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                  period === "monthly"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setPeriod("yearly")}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                  period === "yearly"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Anual
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    period === "yearly"
                      ? "bg-background/20 text-background"
                      : "bg-foreground/10 text-foreground",
                  )}
                >
                  2 meses grátis
                </span>
              </button>
            </div>

            {isLoading ? (
              <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-52 rounded-xl" />
                ))}
              </div>
            ) : null}

            {isError ? (
              <p className="text-center text-sm text-muted-foreground">
                Não foi possível carregar os preços. Tente novamente em instantes.
              </p>
            ) : null}

            {pricing ? (
              <>
                <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
                  {pricing.tiers.map((tier) => (
                    <TierCard
                      key={tier.id}
                      tier={tier}
                      period={period}
                      isSuggested={tier.id === suggestedTier?.id}
                      memberCount={memberCount}
                    />
                  ))}
                </div>

                <div className="w-full rounded-xl border border-border bg-muted/25 p-5 sm:p-6">
                  <p className="text-center text-lg font-semibold tracking-tight">
                    Mesmas funcionalidades em todas as faixas
                  </p>
                  <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
                    A única diferença é quantos membros você gerencia. Sem surpresas,
                    sem paywall por recurso — só o tamanho da sua igreja.
                  </p>
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {pricing.benefits.slice(0, 4).map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="border-t border-border bg-muted/20 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {suggestedTier && suggestedPrice !== null ? (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Sua assinatura: {suggestedTier.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(suggestedPrice)}/mês
                    {period === "yearly"
                      ? ` · ${formatCurrency(suggestedTier.yearlyPrice)} cobrados por ano`
                      : " · cobrança mensal"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Escolha o ciclo e continue para o pagamento seguro.
                </p>
              )}
              {error ? (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <Button type="button" variant="outline" onClick={onClose}>
                Agora não
              </Button>
              <Button
                type="button"
                size="lg"
                className="min-w-[180px]"
                disabled={!canSubscribe || loading || !suggestedTier}
                onClick={() => void subscribe(period)}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Abrindo checkout…
                  </>
                ) : (
                  "Assinar agora"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
