"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { ArrowRight, Clock3 } from "lucide-react";

import {
  homeBenefits,
  homeFaq,
  homeFlows,
  homeHero,
  homeHowItWorks,
} from "@/constants/home";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { GsapReveal, GsapStagger } from "@/components/motion/gsap-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { FamilyGraphPreview } from "@/components/marketing/family-graph-preview";
import { FaqList } from "@/components/marketing/faq-list";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";
import { splitText } from "@/lib/gsap/split-text";
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

const chaosChips = [
  { label: "WhatsApp · Louvor", x: -38, y: -28, rotate: -8 },
  { label: "Planilha escala.xlsx", x: 42, y: -32, rotate: 6 },
  { label: "Grupo · Recepção", x: -48, y: 18, rotate: -4 },
  { label: "Quem confirma?", x: 46, y: 22, rotate: 9 },
  { label: "Print do culto", x: 8, y: -48, rotate: -2 },
  { label: "DM da secretária", x: -12, y: 42, rotate: 5 },
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
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-domain-activities-subtle to-transparent"
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
  const rootRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const mobileCardRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const bloomARef = useRef<HTMLDivElement>(null);
  const bloomBRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) {
      return;
    }

    if (prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const split = splitText(title, "words");

    const onPointer = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(bloomARef.current, {
        x: nx * 36,
        y: ny * 24,
        duration: 1.1,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(bloomBRef.current, {
        x: nx * -28,
        y: ny * -18,
        duration: 1.1,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const ctx = gsap.context(() => {
      gsap.set(split.elements, { yPercent: 115 });
      gsap.set(
        [
          brandRef.current,
          supportRef.current,
          ctaRef.current,
          noteRef.current,
          mobileCardRef.current,
        ],
        { opacity: 0, y: 20 },
      );
      gsap.set(showcaseRef.current, { opacity: 0, y: 48 });
      gsap.set([bloomARef.current, bloomBRef.current], {
        opacity: 0,
        scale: 0.88,
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        [bloomARef.current, bloomBRef.current],
        { opacity: 1, scale: 1, duration: 1.2, stagger: 0.1 },
        0,
      )
        .to(brandRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0.12)
        .to(
          split.elements,
          { yPercent: 0, duration: 0.95, stagger: 0.055 },
          0.22,
        )
        .to(supportRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.55)
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0.68)
        .to(noteRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.78)
        .to(
          mobileCardRef.current,
          { opacity: 1, y: 0, duration: 0.75 },
          0.6,
        )
        .to(showcaseRef.current, { opacity: 1, y: 0, duration: 1 }, 0.5);

      gsap.to(bloomARef.current, {
        y: 22,
        duration: 7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(bloomBRef.current, {
        y: -16,
        duration: 8.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      if (showcaseRef.current) {
        gsap.to(showcaseRef.current, {
          y: -36,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      root.addEventListener("pointermove", onPointer);
    }, root);

    return () => {
      root.removeEventListener("pointermove", onPointer);
      ctx.revert();
      split.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-b border-border"
    >
      <div
        ref={bloomARef}
        aria-hidden
        className="pointer-events-none absolute -left-24 top-[-10%] size-[min(70vw,28rem)] rounded-full opacity-0 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--domain-activities) 22%, transparent), transparent 70%)",
        }}
      />
      <div
        ref={bloomBRef}
        aria-hidden
        className="pointer-events-none absolute -right-16 top-[8%] size-[min(55vw,22rem)] rounded-full opacity-0 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--attention) 26%, transparent), transparent 68%)",
        }}
      />

      <div className="marketing-atmosphere relative">
        <Container className="py-14 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
            <p
              ref={brandRef}
              className="font-display text-sm font-bold tracking-tight text-foreground sm:text-base"
            >
              Minha Church
            </p>
            <h1
              ref={titleRef}
              className="hero-display mt-3 text-balance text-foreground"
            >
              {homeHero.headline}
            </h1>
            <p
              ref={supportRef}
              className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {homeHero.support}
            </p>
            <div
              ref={ctaRef}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Magnetic>
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href={PUBLIC_ROUTES.register}>
                    {homeHero.primaryCta}
                  </Link>
                </Button>
              </Magnetic>
              <a
                href={homeHero.secondaryHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {homeHero.secondaryCta}
                <ArrowRight className="size-3.5" aria-hidden />
              </a>
            </div>
            <p ref={noteRef} className="mt-4 text-sm text-muted-foreground">
              {homeHero.trialNote}
            </p>
          </div>

          <div ref={mobileCardRef} className="mx-auto mt-10 max-w-md lg:hidden">
            <SundayPreviewCard />
          </div>
        </Container>
      </div>

      <div
        ref={showcaseRef}
        className="hidden border-t border-border bg-linear-to-b from-muted/30 to-background lg:block"
      >
        <div className="w-full px-4 py-10 sm:px-6 lg:px-8 xl:py-12">
          <p className="mb-5 text-sm text-muted-foreground">
            Assim a liderança vê a semana
          </p>
          <ProductShowcase className="w-full shadow-popover" />
        </div>
      </div>
    </section>
  );
}

/** Scroll pin: caos (WhatsApp/planilha) → um só lugar. */
export function ChaosToCalmSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLParagraphElement>(null);
  const afterRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const chips = chipsRef.current
      ? Array.from(chipsRef.current.querySelectorAll<HTMLElement>("[data-chaos]"))
      : [];

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(afterRef.current, { opacity: 0, y: 16 });
          gsap.set(cardRef.current, { opacity: 0.15, scale: 0.92, filter: "blur(6px)" });
          gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left center" });
          chips.forEach((chip, i) => {
            const meta = chaosChips[i];
            gsap.set(chip, {
              xPercent: meta?.x ?? 0,
              yPercent: meta?.y ?? 0,
              rotate: meta?.rotate ?? 0,
              opacity: 1,
            });
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=1600",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          });

          tl.to(progressRef.current, { scaleX: 1, ease: "none" }, 0)
            .to(
              chips,
              {
                xPercent: 0,
                yPercent: 0,
                rotate: 0,
                opacity: 0,
                scale: 0.6,
                stagger: 0.04,
                ease: "power2.in",
              },
              0,
            )
            .to(
              beforeRef.current,
              { opacity: 0, y: -20, ease: "power2.in" },
              0.15,
            )
            .to(
              cardRef.current,
              {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                ease: "power2.out",
              },
              0.25,
            )
            .to(
              afterRef.current,
              { opacity: 1, y: 0, ease: "power2.out" },
              0.45,
            );
        },
      );

      mm.add("(max-width: 1023px)", () => {
        gsap.set([beforeRef.current, afterRef.current, cardRef.current], {
          clearProps: "all",
        });
        gsap.set(chips, { clearProps: "all" });
        if (afterRef.current) afterRef.current.style.opacity = "1";
        if (cardRef.current) cardRef.current.style.opacity = "1";
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative border-b border-border bg-linear-to-b from-domain-activities-subtle/35 via-background to-background"
    >
      <div
        ref={progressRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 origin-left scale-x-0 bg-attention"
      />

      <div ref={stageRef} className="flex min-h-svh items-center py-16 lg:py-0">
        <Container className="w-full">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
            <div className="relative max-w-lg">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-domain-activities-foreground uppercase">
                Antes do culto
              </p>
              <div className="relative mt-4 min-h-22 sm:min-h-27">
                <p
                  ref={beforeRef}
                  className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  Mensagens, planilhas, grupos.
                </p>
                <p
                  ref={afterRef}
                  className="absolute inset-x-0 top-0 font-display text-3xl font-bold tracking-tight text-foreground opacity-0 sm:text-4xl"
                >
                  Um domingo, em um só lugar.
                </p>
              </div>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Role e veja o caos da semana se juntar no que a liderança
                realmente precisa — horário, ministério e quem ainda não
                confirmou.
              </p>
              <ul className="mt-8 hidden space-y-3 lg:block">
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
            </div>

            <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
              <div
                ref={chipsRef}
                className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
                aria-hidden
              >
                {chaosChips.map((chip) => (
                  <span
                    key={chip.label}
                    data-chaos
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-xs"
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
              <div ref={cardRef}>
                <SundayPreviewCard />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

export function FamilyGraphDemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const split = splitText(line, "words");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        split.elements,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: {
            trigger: line,
            start: "top 78%",
            end: "bottom 42%",
            scrub: 1,
          },
        },
      );
    }, section);

    return () => {
      ctx.revert();
      split.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="border-b border-border bg-linear-to-b from-domain-members-subtle/40 via-background to-background py-14 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-domain-members-foreground uppercase">
            Cadastro pastoral
          </p>
          <p
            ref={lineRef}
            className="mt-4 font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl"
          >
            Família como grafo, não como lista
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Pais, cônjuges e filhos ligados de forma visual — o diferencial
            para pastorear com contexto, sem caçar parentesco em planilha.
          </p>
        </div>

        <GsapReveal delay={0.05} y={40} className="relative mt-10 min-w-0 sm:mt-12">
          <FamilyGraphPreview />
        </GsapReveal>
      </Container>
    </section>
  );
}

export function FlowsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const getDistance = () =>
            Math.max(0, track.scrollWidth - window.innerWidth + 48);

          gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${getDistance()}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden border-b border-border py-14 sm:py-0"
    >
      <div className="sm:flex sm:min-h-svh sm:flex-col sm:justify-center sm:py-20">
        <Container>
          <Heading as="h2">No lugar de planilhas e grupos</Heading>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Três fluxos do dia a dia — deslize com o scroll.
          </p>
        </Container>

        <div
          ref={trackRef}
          className="mt-10 flex w-max gap-4 px-4 sm:mt-14 sm:gap-6 sm:px-6 lg:px-8"
        >
          {homeFlows.map((flow, index) => {
            const domains = ["members", "schedules", "communication"] as const;
            const domain = domains[index] ?? "home";

            return (
              <article
                key={flow.title}
                className={cn(
                  "flex w-[min(85vw,22rem)] shrink-0 flex-col justify-between rounded-2xl border p-6 sm:w-md sm:p-8",
                  domainSurface[domain],
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
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
                  <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
                    {flow.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {flow.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
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
        <GsapReveal className="max-w-2xl">
          <Heading as="h2">O que você encontra por aqui</Heading>
          <p className="mt-3 text-muted-foreground">
            As telas que a liderança usa na rotina.
          </p>
        </GsapReveal>

        <GsapStagger className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4">
          {screens.map((screen) => (
            <div
              key={screen.title}
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
            </div>
          ))}
        </GsapStagger>
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
        <GsapReveal className="max-w-2xl">
          <Heading as="h2">Como funciona</Heading>
          <p className="mt-3 text-muted-foreground">
            Três passos para começar.
          </p>
        </GsapReveal>

        <GsapStagger className="mt-10 grid list-none gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {homeHowItWorks.map((step, index) => (
            <div key={step.title} className="space-y-2">
              <p className="font-mono text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-base font-medium text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </GsapStagger>
      </Container>
    </section>
  );
}

export function BenefitsSection() {
  return (
    <section className="border-b border-border py-14 sm:py-20">
      <Container>
        <GsapReveal className="max-w-2xl">
          <Heading as="h2">O que muda na prática</Heading>
          <p className="mt-3 text-muted-foreground">
            Para quem cuida da igreja no dia a dia.
          </p>
        </GsapReveal>

        <GsapStagger className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-8">
          {homeBenefits.map((benefit) => (
            <div key={benefit.title}>
              <h3 className="text-base font-medium text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </GsapStagger>
      </Container>
    </section>
  );
}

export function HomeFaqSection() {
  return (
    <section className="border-b border-border py-14 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-14">
          <GsapReveal>
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
          </GsapReveal>
          <GsapReveal delay={0.08} className="min-w-0">
            <FaqList items={[...homeFaq]} />
          </GsapReveal>
        </div>
      </Container>
    </section>
  );
}

export function CtaSection() {
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    if (prefersReducedMotion()) {
      panel.style.opacity = "1";
      return;
    }

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panel,
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, panel);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div
          ref={panelRef}
          className="rounded-2xl border border-border bg-foreground px-5 py-12 text-center text-background opacity-0 sm:px-12 sm:py-14"
        >
          <Heading as="h2" className="text-balance text-background">
            Comece a organizar sua igreja
          </Heading>
          <p className="mx-auto mt-4 max-w-md text-sm text-background/70 sm:text-base">
            30 dias liberados. Sem cartão. Depois, pague só pela faixa de
            membros da sua comunidade.
          </p>
          <div className="mt-8 flex justify-center">
            <Magnetic strength={14}>
              <Button
                size="lg"
                className="w-full bg-background text-foreground hover:bg-background/90 sm:w-auto"
                asChild
              >
                <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </Container>
    </section>
  );
}
