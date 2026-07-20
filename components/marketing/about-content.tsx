"use client";

import { aboutStory } from "@/constants/about";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { HorizontalScrub } from "@/components/motion/horizontal-scrub";
import { MarketingPageHero } from "@/components/motion/marketing-page-hero";
import { PinSteps } from "@/components/motion/pin-steps";
import { ScrubHeadline } from "@/components/motion/scrub-headline";

const values = [
  {
    title: "Simplicidade",
    description:
      "Tecnologia acessível, sem complexidade. Feita para pastores, não para equipes de TI.",
  },
  {
    title: "Comunidade",
    description:
      "Fortalece laços entre líderes e membros — a tecnologia serve ao ministério, não o contrário.",
  },
  {
    title: "Transparência",
    description:
      "Gestão clara de finanças e informações, com confiança e prestação de contas.",
  },
] as const;

export function AboutContent() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Minha Church"
        title="Por que criamos o Minha Church"
        support={aboutStory.origin}
      />

      <PinSteps distance={1500}>
        <div data-pin-step className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Missão
          </p>
          <p className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {aboutStory.mission}
          </p>
        </div>
        <div data-pin-step className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Visão
          </p>
          <p className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {aboutStory.vision}
          </p>
        </div>
      </PinSteps>

      <HorizontalScrub
        intro={
          <div className="max-w-xl">
            <ScrubHeadline>Princípios</ScrubHeadline>
            <p className="mt-3 text-muted-foreground">
              O que guia cada decisão que tomamos.
            </p>
          </div>
        }
      >
        {values.map((value, index) => (
          <article
            key={value.title}
            className="flex w-[min(88vw,22rem)] shrink-0 flex-col rounded-2xl border border-border bg-card p-6 sm:w-sm sm:p-8"
          >
            <span className="font-mono text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
              {value.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {value.description}
            </p>
          </article>
        ))}
      </HorizontalScrub>

      <CtaBanner
        secondaryLabel="Ver recursos"
        secondaryHref={PUBLIC_ROUTES.resources}
      />
    </>
  );
}
