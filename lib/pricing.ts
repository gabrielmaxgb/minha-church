import type { BillingPeriod, PricingTier } from "@/types";

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
  let display: number;
  if (value >= 0.995 && value < 1.005) {
    display = 1;
  } else if (value < 1) {
    display = Math.floor(value * 100) / 100;
  } else {
    display = Math.round(value);
  }

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: display >= 1 ? 0 : 2,
    maximumFractionDigits: display >= 1 ? 0 : 2,
  }).format(display);

  return `≈ ${formatted}`;
}
