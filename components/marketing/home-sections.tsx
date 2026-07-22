"use client";

import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  MapPin,
} from "lucide-react";

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

const sundaySignals = [
  "Prioridades do dia no topo do painel",
  "Agenda da semana com o próximo culto em destaque",
  "Escalas pendentes pedem resposta antes do domingo",
] as const;

/**
 * Marketing preview aligned with dashboard home:
 * prioridades + Agenda da semana (não um mock de lista de pessoas).
 */
function SundayPreviewCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative space-y-3 rounded-2xl border border-border bg-muted/30 p-3 shadow-popover sm:p-3.5",
        className,
      )}
      aria-hidden
    >
      {/* Prioridades — espelha DashboardPriorities */}
      <section className="rounded-xl border border-border bg-card p-3.5 sm:p-4">
        <h2 className="text-sm font-medium text-foreground">
          2 coisas pedem você hoje
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          Resolva estas primeiro — o restante pode esperar
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <div className="flex items-center gap-3 rounded-xl border border-attention-border bg-gradient-to-br from-attention-subtle via-card to-card px-3 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-attention-mark text-attention-foreground">
                <ClipboardList className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                    1.
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">
                    2 escalas aguardam sua resposta
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  Sem isso, o líder não fecha a equipe
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </li>
        </ul>
      </section>

      {/* Agenda — espelha DashboardEventsPanel */}
      <section className="rounded-xl border border-domain-activities/30 bg-gradient-to-br from-domain-activities-subtle via-card to-card">
        <div className="border-b border-domain-activities/20 px-3.5 py-3 sm:px-4">
          <h2 className="text-base font-medium text-domain-activities-foreground">
            Agenda da semana
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Próximos cultos e encontros
          </p>
        </div>

        <ol className="space-y-0.5 p-2">
          <li className="flex items-center gap-3 rounded-md bg-muted/40 px-2.5 py-2.5">
            <time
              dateTime="2026-07-19T19:00"
              className="flex size-10 shrink-0 flex-col items-center justify-center rounded-md border border-foreground/15 bg-foreground text-center leading-none text-background"
            >
              <span className="text-xs font-semibold">19</span>
              <span className="mt-0.5 text-[9px] font-medium tracking-wide text-background/80 uppercase">
                Jul
              </span>
            </time>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  Culto de Domingo
                </p>
                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Em 2 dias
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3 shrink-0" />
                  19:00
                </span>
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">Templo principal</span>
                </span>
                <span className="truncate">Louvor</span>
              </div>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-md px-2.5 py-2.5">
            <time
              dateTime="2026-07-22T20:00"
              className="flex size-10 shrink-0 flex-col items-center justify-center rounded-md border border-border bg-card text-center leading-none text-foreground"
            >
              <span className="text-xs font-semibold">22</span>
              <span className="mt-0.5 text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                Jul
              </span>
            </time>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                Ensaio de louvor
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3 shrink-0" />
                  20:00
                </span>
                <span className="truncate">Louvor</span>
              </div>
            </div>
          </li>
        </ol>
      </section>
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
              Prioridades do dia e a agenda da semana no mesmo painel — o
              essencial para abrir as portas com tranquilidade. Sem caçar
              confirmação em grupo de WhatsApp.
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
