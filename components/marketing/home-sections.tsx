"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";

import {
  homeBenefits,
  homeFaq,
  homeFlows,
  homeHowItWorks,
} from "@/constants/home";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { HomeHeroMotion } from "@/components/marketing/gsap/home-hero-motion";
import { FloatingGeometry } from "@/components/marketing/gsap/floating-geometry";
import { SundayChaosOrder } from "@/components/marketing/gsap/sunday-chaos-order";
import { WordScrub } from "@/components/marketing/gsap/word-scrub";
import { MotionDiv, MotionSection } from "@/components/motion/motion-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { FamilyGraphPreview } from "@/components/marketing/family-graph-preview";
import { FaqList } from "@/components/marketing/faq-list";
import { Heading } from "@/components/ui/heading";
import { fadeInUp } from "@/lib/motion";
import { domainMark, domainSurface, domainText } from "@/lib/ui/domain-theme";
import { cn } from "@/lib/utils";

const sundayPending = [
  { name: "Ana Silva", role: "Vocal", initials: "AS" },
  { name: "Carlos Mendes", role: "Violão", initials: "CM" },
  { name: "João Pereira", role: "Recepção", initials: "JP" },
] as const;

const sundaySignals = [
  "Horário e local no mesmo lugar",
  "Ministério e função visíveis",
  "Quem ainda não respondeu, em destaque",
] as const;

function SundayPreviewCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-domain-activities/25 bg-card shadow-popover",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-domain-activities-subtle to-transparent"
        aria-hidden
      />

      <div className="relative border-b border-border/70 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-domain-activities-foreground uppercase">
            Próximo culto
          </p>
          <span className="rounded-full bg-attention-subtle px-2.5 py-0.5 text-[11px] font-medium text-attention-foreground">
            Em 2 dias
          </span>
        </div>
      </div>

      <div className="relative space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-3.5">
          <time
            dateTime="2026-07-19T19:00"
            className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-domain-activities/20 bg-domain-activities-subtle py-2 text-center"
            aria-label="19 de julho"
          >
            <span className="text-[1.45rem] font-semibold leading-none tracking-tight text-foreground">
              19
            </span>
            <span className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-domain-activities-foreground uppercase">
              Jul
            </span>
          </time>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              Culto de Domingo
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-medium tabular-nums text-foreground">
                <Clock3 className="size-3.5 opacity-70" aria-hidden />
                19:00
              </span>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span>Louvor</span>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span>Templo principal</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-attention-border bg-attention-subtle/80 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-attention-foreground">
              3 ainda não responderam
            </p>
            <span
              className="flex size-2 shrink-0 rounded-full bg-attention-solid"
              aria-hidden
            />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sem isso, a escala do culto não fecha.
          </p>

          <ul className="mt-3 space-y-2">
            {sundayPending.map((person) => (
              <li
                key={person.name}
                className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card/90 px-2.5 py-2"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold tracking-wide text-foreground"
                  aria-hidden
                >
                  {person.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {person.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {person.role}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-attention-subtle px-2 py-0.5 text-[11px] font-medium text-attention-foreground">
                  Aguardando
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="marketing-atmosphere relative border-b border-border">
      <FloatingGeometry />
      <Container className="relative z-10 py-12 sm:py-16 lg:py-20">
        <HomeHeroMotion
          mobilePreview={
            <div className="mx-auto mt-10 max-w-md lg:hidden">
              <SundayPreviewCard />
            </div>
          }
        />
      </Container>

      <div className="relative z-10 hidden border-t border-border bg-gradient-to-b from-muted/30 to-background lg:block">
        <div className="w-full px-4 py-10 sm:px-6 lg:px-8 xl:py-12">
          <MotionDiv variants={fadeInUp}>
            <p className="mb-5 text-sm text-muted-foreground">
              Assim a liderança vê a semana
            </p>
            <ProductShowcase className="w-full shadow-popover" />
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}

export function OperationDemoSection() {
  // Desktop: pin+scrub caos → ordem. Mobile: card already in hero.
  return (
    <section className="hidden border-b border-border bg-gradient-to-b from-domain-activities-subtle/35 via-background to-background lg:block">
      <SundayChaosOrder
        copy={
          <>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-domain-activities-foreground uppercase">
              Antes do culto
            </p>
            <Heading as="h2" className="mt-3 text-balance">
              Um domingo organizado, sem correria
            </Heading>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Horário, ministério e quem ainda não confirmou — o essencial
              para abrir as portas com tranquilidade. Sem caçar confirmação
              em grupo de WhatsApp.
            </p>

            <ul className="mt-8 space-y-3">
              {sundaySignals.map((signal) => (
                <li
                  key={signal}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-domain-activities"
                    aria-hidden
                  />
                  <span className="leading-snug">{signal}</span>
                </li>
              ))}
            </ul>
          </>
        }
        card={
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-domain-activities-subtle/50 blur-2xl"
              aria-hidden
            />
            <SundayPreviewCard className="relative mx-auto max-w-md xl:ml-auto xl:mr-0" />
          </div>
        }
      />
    </section>
  );
}

export function FamilyGraphDemoSection() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-domain-members-subtle/40 via-background to-background py-14 sm:py-20 lg:py-24">
      <Container>
        <MotionSection variants={fadeInUp} className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-domain-members-foreground uppercase">
            Cadastro pastoral
          </p>
          <Heading as="h2" className="mt-3 text-balance">
            Família como grafo, não como lista
          </Heading>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Pais, cônjuges e filhos ligados de forma visual — o diferencial
            para pastorear com contexto, sem caçar parentesco em planilha.
          </p>
        </MotionSection>

        <MotionDiv variants={fadeInUp} className="relative mt-10 min-w-0 sm:mt-12">
          <FamilyGraphPreview />
        </MotionDiv>
      </Container>
    </section>
  );
}

export function FlowsSection() {
  return (
    <section className="border-b border-border py-14 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <WordScrub
            as="h2"
            className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl leading-snug"
          >
            No lugar de planilhas e grupos
          </WordScrub>
          <p className="mt-3 text-muted-foreground">
            Três fluxos do dia a dia da igreja.
          </p>
        </div>

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
      title: "Famílias",
      description: "Grafo de parentesco — o mesmo que você abre no cadastro.",
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
    <CtaBanner
      title="Comece a organizar sua igreja"
      description="30 dias liberados. Sem cartão. Depois, pague só pela faixa de membros da sua comunidade."
      primaryLabel="Começar grátis"
      primaryHref={PUBLIC_ROUTES.register}
    />
  );
}
