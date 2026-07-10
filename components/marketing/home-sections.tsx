"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  homeBenefits,
  homeFaq,
  homeFlows,
  homeHero,
  homeHowItWorks,
} from "@/constants/home";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { MotionDiv, MotionSection } from "@/components/motion/motion-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { FaqList } from "@/components/marketing/faq-list";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { fadeInUp } from "@/lib/motion";
import { domainMark, domainSurface, domainText } from "@/lib/ui/domain-theme";
import { cn } from "@/lib/utils";

function SundayPreviewCard({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        "rounded-lg border border-domain-activities/20 bg-domain-activities-subtle p-5 text-left sm:p-6"
      }
    >
      <p className="text-xs font-medium text-domain-activities-foreground">
        Próximo culto
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
        Culto de Domingo · 19:00
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Louvor · Templo principal
      </p>
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-medium text-attention-foreground">
          3 voluntários ainda não responderam
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Ana Silva — vocal</li>
          <li>Carlos Mendes — violão</li>
          <li>João Pereira — recepção</li>
        </ul>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="marketing-atmosphere border-b border-border">
      <Container className="py-12 sm:py-16 lg:py-20">
        <MotionDiv variants={fadeInUp} className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
          <h1 className="hero-display text-balance text-foreground">
            {homeHero.headline}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {homeHero.support}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href={PUBLIC_ROUTES.register}>{homeHero.primaryCta}</Link>
            </Button>
            <a
              href={homeHero.secondaryHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {homeHero.secondaryCta}
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {homeHero.trialNote}
          </p>
        </MotionDiv>

        <MotionDiv variants={fadeInUp} className="mx-auto mt-10 max-w-md lg:hidden">
          <SundayPreviewCard />
        </MotionDiv>
      </Container>

      <div className="hidden border-t border-border bg-gradient-to-b from-muted/30 to-background lg:block">
        <Container className="py-10 xl:py-12">
          <MotionDiv variants={fadeInUp}>
            <p className="mb-5 text-sm text-muted-foreground">
              Assim a liderança vê a semana
            </p>
            <ProductShowcase className="w-full shadow-popover" />
          </MotionDiv>
        </Container>
      </div>
    </section>
  );
}

export function OperationDemoSection() {
  // No mobile o card já aparece no hero; aqui reforça a narrativa só no desktop.
  return (
    <section className="hidden border-b border-border py-14 sm:py-20 lg:block">
      <Container>
        <MotionSection variants={fadeInUp}>
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="max-w-md">
              <Heading as="h2">Um domingo organizado, sem correria</Heading>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Horário, ministério e quem ainda não confirmou — o essencial
                para abrir as portas com tranquilidade.
              </p>
            </div>
            <SundayPreviewCard />
          </div>
        </MotionSection>
      </Container>
    </section>
  );
}

export function FlowsSection() {
  return (
    <section className="border-b border-border py-14 sm:py-20">
      <Container>
        <MotionSection variants={fadeInUp} className="max-w-2xl">
          <Heading as="h2">No lugar de planilhas e grupos</Heading>
          <p className="mt-3 text-muted-foreground">
            Três fluxos do dia a dia da igreja.
          </p>
        </MotionSection>

        <div className="mt-10 divide-y divide-border border-y border-border sm:mt-12">
          {homeFlows.map((flow, index) => {
            const domains = ["members", "schedules", "communication"] as const;
            const domain = domains[index] ?? "home";

            return (
              <MotionDiv
                key={flow.title}
                variants={fadeInUp}
                className="grid gap-2 py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-6 sm:py-8"
              >
                <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-2">
                  <span
                    className={cn("size-2 rounded-full", domainMark[domain])}
                    aria-hidden
                  />
                  <span
                    className={cn("font-mono text-sm", domainText[domain])}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0 max-w-2xl">
                  <h3 className="text-base font-medium text-foreground">
                    {flow.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {flow.description}
                  </p>
                </div>
              </MotionDiv>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function ScreensSection() {
  const screens = [
    {
      title: "A semana",
      description: "Próximo culto e o que ainda precisa da sua atenção.",
      domain: "home" as const,
    },
    {
      title: "Escalas",
      description: "Quem foi convidado, quem confirmou e o que ainda falta.",
      domain: "schedules" as const,
    },
    {
      title: "Membros",
      description: "Cadastro pastoral com histórico da comunidade.",
      domain: "members" as const,
    },
  ];

  return (
    <section className="border-b border-border py-14 sm:py-20">
      <Container>
        <MotionSection variants={fadeInUp} className="max-w-2xl">
          <Heading as="h2">O que você encontra por aqui</Heading>
          <p className="mt-3 text-muted-foreground">
            As telas que a liderança usa na rotina.
          </p>
        </MotionSection>

        <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4">
          {screens.map((screen) => (
            <MotionDiv
              key={screen.title}
              variants={fadeInUp}
              className={cn(
                "rounded-lg border p-5",
                domainSurface[screen.domain],
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    domainMark[screen.domain],
                  )}
                  aria-hidden
                />
                <h3
                  className={cn(
                    "text-sm font-medium",
                    domainText[screen.domain],
                  )}
                >
                  {screen.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {screen.description}
              </p>
            </MotionDiv>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-24 border-b border-border py-14 sm:py-20"
    >
      <Container>
        <MotionSection variants={fadeInUp} className="max-w-2xl">
          <Heading as="h2">Como funciona</Heading>
          <p className="mt-3 text-muted-foreground">
            Três passos para começar.
          </p>
        </MotionSection>

        <ol className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {homeHowItWorks.map((step, index) => (
            <MotionDiv key={step.title} variants={fadeInUp} className="space-y-2">
              <p className="font-mono text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-base font-medium text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </MotionDiv>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function BenefitsSection() {
  return (
    <section className="border-b border-border py-14 sm:py-20">
      <Container>
        <MotionSection variants={fadeInUp} className="max-w-2xl">
          <Heading as="h2">O que muda na prática</Heading>
          <p className="mt-3 text-muted-foreground">
            Para quem cuida da igreja no dia a dia.
          </p>
        </MotionSection>

        <div className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-8">
          {homeBenefits.map((benefit) => (
            <MotionDiv key={benefit.title} variants={fadeInUp}>
              <h3 className="text-base font-medium text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </MotionDiv>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HomeFaqSection() {
  return (
    <section className="border-b border-border py-14 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-14">
          <MotionSection variants={fadeInUp}>
            <Heading as="h2">Perguntas frequentes</Heading>
            <p className="mt-3 text-sm text-muted-foreground">
              Trial, preço, dados e para quem é.
            </p>
            <Link
              href={PUBLIC_ROUTES.faq}
              className="mt-4 inline-flex text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
            >
              Ver todas
            </Link>
          </MotionSection>
          <MotionDiv variants={fadeInUp} className="min-w-0">
            <FaqList items={[...homeFaq]} />
          </MotionDiv>
        </div>
      </Container>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <MotionSection
          className="rounded-2xl border border-border bg-foreground px-5 py-12 text-center text-background sm:px-12 sm:py-14"
          variants={fadeInUp}
        >
          <Heading as="h2" className="text-balance text-background">
            Comece a organizar sua igreja
          </Heading>
          <p className="mx-auto mt-4 max-w-md text-sm text-background/70 sm:text-base">
            30 dias liberados. Sem cartão. Depois, pague só pela faixa de
            membros da sua comunidade.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="w-full bg-background text-foreground hover:bg-background/90 sm:w-auto"
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
