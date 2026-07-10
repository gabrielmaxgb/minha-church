import type { BillingPeriod, PricingTier } from "@/types";
import { pricing } from "@/constants/pricing";

export function getTierBillingComparison(tier: PricingTier) {
  const monthlyTotalYear = tier.monthlyPrice * 12;
  const savings = monthlyTotalYear - tier.yearlyPrice;
  const monthsFree = Math.round(savings / tier.monthlyPrice);
  const effectiveMonthlyFromYearly = tier.yearlyPrice / 12;
  const discountPercent = Math.round((savings / monthlyTotalYear) * 100);

  return {
    monthlyTotalYear,
    savings,
    monthsFree,
    effectiveMonthlyFromYearly,
    discountPercent,
  };
}

export function getTierMonthlyPrice(
  tier: PricingTier,
  period: BillingPeriod,
): number {
  if (period === "monthly") {
    return tier.monthlyPrice;
  }

  return getTierBillingComparison(tier).effectiveMonthlyFromYearly;
}

export function getPricePerMember(
  tier: PricingTier,
  period: BillingPeriod,
): number {
  return (
    getTierMonthlyPrice(tier, period) / tier.memberCountForPricePerMember
  );
}

export function formatPricePerMember(value: number): string {
  let minimumFractionDigits = 0;
  let maximumFractionDigits = 0;

  if (value < 1) {
    minimumFractionDigits = 2;
    maximumFractionDigits = 2;
  } else if (value < 10) {
    minimumFractionDigits = 2;
    maximumFractionDigits = 2;
  }

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

  return `≈ ${formatted}`;
}

/** Faixa de preço sugerida com base na quantidade de membros cadastrados. */
export function suggestTierByMemberCount(
  memberCount: number,
  tiers: readonly PricingTier[] = pricing.tiers,
): PricingTier {
  const list = tiers.length > 0 ? tiers : pricing.tiers;

  if (memberCount <= 100) {
    return list[0];
  }

  if (memberCount <= 300) {
    return list[1];
  }

  if (memberCount <= 700) {
    return list[2];
  }

  return list[3];
}

export function formatMemberCountLabel(memberCount: number): string {
  if (memberCount >= 1000) {
    return "1.000+ membros";
  }

  return `${memberCount} membros`;
}
