"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { pricing as pricingFallback } from "@/constants/pricing";
import { usePricing } from "@/lib/api/queries";
import { PUBLIC_ROUTES } from "@/constants/routes";
import {
  formatMemberCountLabel,
  formatPricePerMember,
  getPricePerMember,
  getTierMonthlyPrice,
  suggestTierByMemberCount,
} from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";
import type { BillingPeriod } from "@/types";

const MEMBER_PRESETS = [40, 80, 150, 250, 400, 800] as const;

interface PricingCalculatorProps {
  period: BillingPeriod;
  className?: string;
}

export function PricingCalculator({ period, className }: PricingCalculatorProps) {
  const [memberCount, setMemberCount] = useState(150);
  const { data: pricingData } = usePricing();
  const tiers = pricingData?.tiers ?? pricingFallback.tiers;

  const suggestedTier = useMemo(
    () => suggestTierByMemberCount(memberCount, tiers),
    [memberCount, tiers],
  );

  const monthlyPrice = getTierMonthlyPrice(suggestedTier, period);
  const pricePerMember = getPricePerMember(suggestedTier, period);

  return (
    <div
      className={cn(
        "mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 sm:p-8",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Users className="size-5" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">
            Descubra a faixa da sua igreja
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Informe quantos membros você costuma cadastrar. Mostramos a faixa e o
            investimento — sem escolher plano manualmente.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="member-count-slider" className="text-sm font-medium">
              Membros cadastrados
            </label>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-semibold tabular-nums">
              {formatMemberCountLabel(memberCount)}
            </span>
          </div>
          <input
            id="member-count-slider"
            type="range"
            min={20}
            max={1000}
            step={10}
            value={memberCount}
            onChange={(event) => setMemberCount(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer accent-primary"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {MEMBER_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMemberCount(preset)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  memberCount === preset
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {preset === 800 ? "800+" : preset}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/80 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Faixa sugerida
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight">
            {suggestedTier.name}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {suggestedTier.memberRange}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-3xl font-bold tracking-tight tabular-nums">
                {formatCurrency(monthlyPrice)}
                <span className="text-base font-normal text-muted-foreground">
                  /mês
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatPricePerMember(pricePerMember)} por membro · todas as
                funcionalidades incluídas
              </p>
            </div>
            <Button asChild className="shrink-0 gap-1.5">
              <Link href={PUBLIC_ROUTES.register}>
                Testar 30 dias grátis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Cobrança só depois do período de teste. Sem cartão para começar.
        </p>
      </div>
    </div>
  );
}
