"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { billingFaq } from "@/constants/faq";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqList } from "@/components/marketing/faq-list";
import { PlanComparison } from "@/components/marketing/plan-comparison";
import { MotionSection } from "@/components/motion/motion-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading, SectionHeader, SectionLabel } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/lib/api/queries/use-plans";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { BillingPeriod } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

function formatPrice(price: number, period: BillingPeriod) {
  if (price === 0) return "Grátis";
  const suffix = period === "monthly" ? "/mês" : "/ano";
  return `R$ ${price}${suffix}`;
}

function PlansSkeleton() {
  return (
    <div className="mt-16 grid gap-6 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex flex-col shadow-none">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <Skeleton className="h-9 w-28" />
            {Array.from({ length: 4 }).map((__, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function PricingSection() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const { data: plans, isLoading, isError } = usePlans();

  return (
    <>
      <section className="py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Planos</SectionLabel>
            <Heading as="h1" className="mt-3">
              Escolha o plano ideal para sua igreja
            </Heading>
            <p className="mt-4 text-muted-foreground">
              Comece grátis e evolua conforme sua comunidade cresce. Teste os
              planos pagos por 14 dias, sem cartão.
            </p>

            <div className="mt-8 inline-flex rounded-lg border border-border p-1">
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
                <span className="ml-1.5 text-xs opacity-70">−2 meses</span>
              </button>
            </div>
          </div>

          {isLoading && <PlansSkeleton />}

          {isError && (
            <p className="mt-16 text-center text-muted-foreground">
              Não foi possível carregar os planos. Tente novamente mais tarde.
            </p>
          )}

          {plans && (
            <MotionSection
              className="mt-16 grid gap-6 lg:grid-cols-3"
              variants={staggerContainer}
            >
              {plans.map((plan) => (
                <motion.div key={plan.id} variants={staggerItem}>
                  <Card
                    className={cn(
                      "relative flex h-full flex-col shadow-none",
                      plan.highlighted && "border-foreground",
                    )}
                  >
                    {plan.highlighted && (
                      <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        Mais popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="font-display text-3xl font-bold tracking-tight">
                        {formatPrice(
                          period === "monthly"
                            ? plan.monthlyPrice
                            : plan.yearlyPrice,
                          period,
                        )}
                      </p>
                      <ul className="mt-6 space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-sm text-muted-foreground"
                          >
                            <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={plan.highlighted ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </MotionSection>
          )}
        </Container>
      </section>

      <section className="border-t border-border bg-muted/30 py-24 sm:py-32">
        <Container>
          <SectionHeader
            label="Comparação"
            title="Compare os planos lado a lado"
            description="Veja qual plano atende melhor o tamanho e as necessidades da sua igreja."
          />
          <div className="mt-12">
            <PlanComparison />
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeader
            label="Dúvidas"
            title="Perguntas sobre cobrança"
          />
          <div className="mx-auto mt-12 max-w-2xl">
            <FaqList items={billingFaq} />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Mais perguntas? Veja nossa{" "}
            <a href="/faq" className="font-medium text-foreground underline-offset-4 hover:underline">
              página de FAQ
            </a>
            .
          </p>
        </Container>
      </section>

      <CtaBanner
        title="Teste grátis por 14 dias"
        description="Sem cartão de crédito. Cancele quando quiser."
        primaryLabel="Começar grátis"
        primaryHref="/planos"
        secondaryLabel="Ver recursos"
        secondaryHref="/recursos"
      />
    </>
  );
}
