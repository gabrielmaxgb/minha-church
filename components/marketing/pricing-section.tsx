"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

import { billingFaq } from "@/constants/faq";
import { marketingPitch } from "@/constants/marketing-pitch";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqList } from "@/components/marketing/faq-list";
import { Magnetic } from "@/components/marketing/gsap/magnetic";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import {
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-section";
import { PricingCalculator } from "@/components/marketing/pricing-calculator";
import { MotionSection } from "@/components/motion/motion-section";
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
import {
  formatPricePerMember,
  getPricePerMember,
  getTierBillingComparison,
} from "@/lib/pricing";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { BillingPeriod, PricingTier } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { motion } from "motion/react";

function TierPriceComparison({
  tier,
  period,
  highlighted,
}: {
  tier: PricingTier;
  period: BillingPeriod;
  highlighted?: boolean;
}) {
  const {
    monthlyTotalYear,
    savings,
    monthsFree,
    effectiveMonthlyFromYearly,
    discountPercent,
  } = getTierBillingComparison(tier);

  const muted = highlighted ? "text-background/70" : "text-muted-foreground";
  const subtle = highlighted ? "text-background/50" : "text-muted-foreground";
  const emphasis = highlighted ? "text-background" : "text-foreground";
  const border = highlighted ? "border-background/20" : "border-border";
  const pricePerMember = getPricePerMember(tier, period);

  if (period === "yearly") {
    return (
      <div className="space-y-2">
        <div>
          <p className="text-2xl font-bold tracking-tight">
            {formatCurrency(effectiveMonthlyFromYearly)}
            <span className={cn("text-base font-normal", muted)}>/mês</span>
          </p>
          <p className={cn("mt-1 text-xs", muted)}>
            {formatCurrency(tier.yearlyPrice)} cobrados uma vez por ano
          </p>
          <p className={cn("mt-2 text-sm font-medium", emphasis)}>
            {formatPricePerMember(pricePerMember)} por membro
          </p>
        </div>
        <div className={cn("space-y-1 border-t pt-2 text-xs", border)}>
          <p className={muted}>
            <span className="line-through">
              {formatCurrency(tier.monthlyPrice)}/mês
            </span>{" "}
            no plano mensal
          </p>
          <p className={cn("font-medium", emphasis)}>
            Economize {formatCurrency(savings)} · {monthsFree} meses grátis (
            {discountPercent}%)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-2xl font-bold tracking-tight">
          {formatCurrency(tier.monthlyPrice)}
          <span className={cn("text-base font-normal", muted)}>/mês</span>
        </p>
        <p className={cn("mt-1 text-xs", muted)}>
          {formatCurrency(monthlyTotalYear)}/ano no ciclo mensal
        </p>
        <p className={cn("mt-2 text-sm font-medium", emphasis)}>
          {formatPricePerMember(pricePerMember)} por membro
        </p>
      </div>
      <div className={cn("border-t pt-2 text-xs", border, subtle)}>
        <p>
          No anual:{" "}
          <span className={cn("font-medium", emphasis)}>
            {formatCurrency(effectiveMonthlyFromYearly)}/mês
          </span>{" "}
          · {monthsFree} meses grátis ({formatCurrency(savings)} de economia)
        </p>
      </div>
    </div>
  );
}

function IncludedBenefits({
  benefits,
  className,
}: {
  benefits: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl rounded-lg border border-border bg-muted/30 p-6 sm:p-8",
        className,
      )}
    >
      <p className="text-center text-lg font-semibold tracking-tight">
        {marketingPitch.pricingIncludedBannerTitle}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
        {marketingPitch.pricingIncludedBannerSupport}
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2.5 text-sm text-foreground"
          >
            <Check className="mt-0.5 size-4 shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        30 dias gratuitos · sem fidelidade · cancele quando quiser
      </p>
    </div>
  );
}

function ValueAnchor({
  headline,
  example,
  className,
}: {
  headline: string;
  example: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-2xl rounded-lg border border-dashed border-border px-6 py-5 text-center",
        className,
      )}
    >
      <p className="text-sm leading-relaxed text-foreground">{headline}</p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">
        {example}
      </p>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <>
      <Skeleton className="mx-auto mt-12 h-48 max-w-3xl rounded-lg" />
      <Skeleton className="mx-auto mt-6 h-24 max-w-2xl rounded-lg" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className={cn("shadow-none", i === 1 && "lg:min-h-[22rem]")}
          >
            <CardHeader>
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export function PricingSection() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const { data: pricing, isLoading, isError } = usePricing();

  return (
    <>
      <MarketingPageHero
        title="Planos conforme o tamanho da igreja"
        support={marketingPitch.pricingHero}
      />

      <MarketingSection>
        {isLoading && <PricingSkeleton />}

        {isError && (
          <p className="text-center text-muted-foreground">
            Não foi possível carregar os preços. Tente novamente mais tarde.
          </p>
        )}

        {pricing ? (
          <>
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex rounded-lg border border-border p-1">
                <button
                  type="button"
                  onClick={() => setPeriod("monthly")}
                  className={cn(
                    "cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
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
                    "cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                    period === "yearly"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Anual
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                      period === "yearly"
                        ? "bg-background/20 text-background"
                        : "bg-foreground/10 text-foreground",
                    )}
                  >
                    2 meses grátis
                  </span>
                </button>
              </div>
            </div>

            <PricingCalculator period={period} className="mt-8" />

            <MarketingSectionIntro
              className="mx-auto mt-14 text-center"
              title={marketingPitch.pricingTableTitle}
              support={marketingPitch.pricingTableSupport}
            />

            <MotionSection
              className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:items-center"
              variants={staggerContainer}
            >
              {pricing.tiers.map((tier) => (
                <motion.div
                  key={tier.id}
                  variants={staggerItem}
                  className={cn(
                    tier.highlighted && "sm:col-span-2 lg:col-span-1",
                  )}
                >
                  <Card
                    className={cn(
                      "relative flex h-full flex-col shadow-none transition-shadow",
                      tier.highlighted
                        ? "border-foreground bg-foreground text-background lg:scale-[1.06] lg:shadow-2xl"
                        : "border-border",
                    )}
                  >
                    <CardHeader>
                      {tier.highlighted && (
                        <span className="mb-2 inline-flex w-fit rounded-full bg-background/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-background uppercase">
                          Mais vendida
                        </span>
                      )}
                      <CardTitle
                        className={cn(
                          "tracking-tight",
                          tier.highlighted
                            ? "text-xl font-bold"
                            : "text-base font-semibold",
                        )}
                      >
                        {tier.name}
                      </CardTitle>
                      <CardDescription
                        className={cn(
                          "text-xs leading-relaxed",
                          tier.highlighted
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.memberRange}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-6">
                      <TierPriceComparison
                        tier={tier}
                        period={period}
                        highlighted={tier.highlighted}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </MotionSection>

            <div className="mt-10 flex flex-col items-center gap-3 text-center">
              <Magnetic>
                <Button size="lg" asChild>
                  <Link href={PUBLIC_ROUTES.register}>{pricing.cta}</Link>
                </Button>
              </Magnetic>
              <p className="max-w-md text-sm text-muted-foreground">
                A faixa acompanha o número de membros da igreja. Comece o teste
                gratuito — a cobrança só começa se você continuar.
              </p>
            </div>

            <IncludedBenefits benefits={pricing.benefits} className="mt-12" />

            <ValueAnchor
              headline={pricing.valueAnchor.headline}
              example={pricing.valueAnchor.example}
              className="mt-6"
            />
          </>
        ) : null}
      </MarketingSection>

      <MarketingSection muted>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-14">
          <MarketingSectionIntro
            title="Dúvidas sobre cobrança"
            support={marketingPitch.pricingFaqSupport}
          >
            <p className="mt-4 text-sm text-muted-foreground">
              Mais perguntas? Veja nossa{" "}
              <Link
                href={PUBLIC_ROUTES.faq}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                página de FAQ
              </Link>
              .
            </p>
          </MarketingSectionIntro>
          <div className="min-w-0">
            <FaqList items={billingFaq} />
          </div>
        </div>
      </MarketingSection>

      <CtaBanner
        title={marketingPitch.pricingCtaTitle}
        description={marketingPitch.ctaDescription}
        primaryLabel="Começar grátis"
        primaryHref={PUBLIC_ROUTES.register}
        secondaryLabel="Ver recursos"
        secondaryHref={PUBLIC_ROUTES.resources}
      />
    </>
  );
}
