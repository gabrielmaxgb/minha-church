"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

import { billingFaq } from "@/constants/faq";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqList } from "@/components/marketing/faq-list";
import { MotionSection } from "@/components/motion/motion-section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading, SectionHeader } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { PricingCalculator } from "@/components/marketing/pricing-calculator";
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
        O mesmo Minha Church em todas as faixas — do primeiro ao último membro
      </p>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
        Escalas, comunicados, ministérios, permissões e cadastro pastoral: tudo
        liberado em qualquer faixa. A diferença é só quantos membros você
        gerencia.
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
        30 dias grátis · sem fidelidade · cancele quando quiser
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
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
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
      <section className="border-b border-border">
        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <Heading as="h1" className="text-balance">
              Investimento justo para o tamanho da sua igreja
            </Heading>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              As mesmas ferramentas em todas as faixas — você paga conforme
              quantos membros cadastra, não por pacote de funcionalidades.{" "}
              <span className="font-medium text-foreground">30 dias grátis</span>
              , sem cartão.
            </p>
          </div>

          {isLoading && <PricingSkeleton />}

          {isError && (
            <p className="mt-16 text-center text-muted-foreground">
              Não foi possível carregar os preços. Tente novamente mais tarde.
            </p>
          )}

          {pricing && (
            <>
            <div className="mx-auto mt-12 max-w-3xl text-center">
              <div className="inline-flex rounded-lg border border-border p-1">
                <button
                  type="button"
                  onClick={() => setPeriod("monthly")}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
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
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
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
            </div>

              <PricingCalculator period={period} className="mt-8" />

            <div className="mx-auto max-w-3xl text-center">
              <p className="mt-14 text-sm font-medium text-muted-foreground">
                Tabela completa por faixa
              </p>
            </div>

              <MotionSection
                className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-center"
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
                          <span className="mb-2 inline-flex w-fit rounded-full bg-background/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
                            Mais escolhida
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
                      <CardContent className="flex-1">
                        <TierPriceComparison
                          tier={tier}
                          period={period}
                          highlighted={tier.highlighted}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button
                          className={cn(
                            "w-full",
                            tier.highlighted &&
                              "bg-background text-foreground hover:bg-background/90",
                          )}
                          variant={tier.highlighted ? "secondary" : "outline"}
                          asChild
                        >
                          <Link href={PUBLIC_ROUTES.register}>{pricing.cta}</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </MotionSection>

              <IncludedBenefits benefits={pricing.benefits} className="mt-12" />

              <ValueAnchor
                headline={pricing.valueAnchor.headline}
                example={pricing.valueAnchor.example}
                className="mt-6"
              />
            </>
          )}
        </Container>
      </section>

      <section className="border-t border-border bg-muted/30 py-24 sm:py-32">
        <Container>
          <SectionHeader label="Dúvidas" title="Perguntas sobre cobrança" />
          <div className="mx-auto mt-12 max-w-2xl">
            <FaqList items={billingFaq} />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Mais perguntas? Veja nossa{" "}
            <Link
              href={PUBLIC_ROUTES.faq}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              página de FAQ
            </Link>
            .
          </p>
        </Container>
      </section>

      <CtaBanner
        title="30 dias para organizar sua igreja de verdade"
        description="Use tudo — membros, escalas, comunicados e ministérios. Só escolhe a faixa quando decidir continuar."
        primaryLabel="Começar grátis"
        primaryHref={PUBLIC_ROUTES.register}
        secondaryLabel="Ver recursos"
        secondaryHref={PUBLIC_ROUTES.resources}
      />
    </>
  );
}
