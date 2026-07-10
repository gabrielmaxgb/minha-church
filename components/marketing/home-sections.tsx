"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { homeFeatures } from "@/constants/features";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { MotionDiv, MotionSection } from "@/components/motion/motion-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { fadeInUp } from "@/lib/motion";

export function HeroSection() {
  return (
    <section className="border-b border-border">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <MotionDiv variants={fadeInUp} className="max-w-xl">
            <p className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              Minha Church
            </p>
            <Heading as="h1" className="mt-4 text-balance">
              A operação da igreja, em um só lugar
            </Heading>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Membros, escalas, finanças e comunicação — sem planilhas e sem
              grupos espalhados.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button size="lg" asChild>
                <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
              </Button>
              <Link
                href={PUBLIC_ROUTES.resources}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Ver recursos
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              30 dias grátis · Sem cartão · A partir de R$ 119/mês
            </p>
          </MotionDiv>

          <MotionDiv
            variants={fadeInUp}
            className="min-w-0 lg:justify-self-end"
          >
            <ProductShowcase className="w-full" />
          </MotionDiv>
        </div>
      </Container>
    </section>
  );
}

export function FeaturesSection() {
  const highlights = homeFeatures.slice(0, 3);

  return (
    <section className="border-b border-border py-20 sm:py-28">
      <Container>
        <MotionSection variants={fadeInUp} className="max-w-2xl">
          <Heading as="h2">O essencial da rotina pastoral</Heading>
          <p className="mt-3 text-muted-foreground">
            Três frentes que substituem planilhas, grupos e ferramentas
            desconectadas.
          </p>
        </MotionSection>

        <div className="mt-14 divide-y divide-border border-y border-border">
          {highlights.map((feature, index) => (
            <MotionDiv
              key={feature.title}
              variants={fadeInUp}
              className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
            >
              <span className="font-mono text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-base font-medium text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <p className="mt-3 text-sm text-foreground/80">
                  {feature.items.join(" · ")}
                </p>
              </div>
            </MotionDiv>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href={PUBLIC_ROUTES.resources}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
          >
            Ver todos os recursos
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <MotionSection
          className="border border-border bg-foreground px-8 py-14 text-center text-background sm:px-16"
          variants={fadeInUp}
        >
          <Heading as="h2" className="text-background">
            Comece a organizar sua igreja
          </Heading>
          <p className="mx-auto mt-4 max-w-md text-background/70">
            30 dias com tudo liberado. Sem cartão. Depois, pague só pela faixa
            do tamanho da sua comunidade.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
              asChild
            >
              <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
            </Button>
          </div>
        </MotionSection>
      </Container>
    </section>
  );
}
