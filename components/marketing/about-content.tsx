"use client";

import { aboutStory } from "@/constants/about";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import {
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-section";
import { MotionDiv, MotionSection } from "@/components/motion/motion-section";
import { fadeInUp } from "@/lib/motion";

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
        title="Por que criamos o Minha Church"
        support={aboutStory.origin}
      />

      <MarketingSection>
        <MotionSection variants={fadeInUp} className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Missão
          </p>
          <p className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">
            {aboutStory.mission}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {aboutStory.vision}
          </p>
        </MotionSection>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionIntro
          title="Princípios"
          support="O que guia cada decisão que tomamos."
        />

        <div className="mt-10 divide-y divide-border border-y border-border sm:mt-12">
          {values.map((value, index) => (
            <MotionDiv
              key={value.title}
              variants={fadeInUp}
              className="grid gap-2 py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-6 sm:py-8"
            >
              <span className="font-mono text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 max-w-2xl">
                <h3 className="text-base font-medium text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </MarketingSection>

      <CtaBanner
        secondaryLabel="Ver recursos"
        secondaryHref={PUBLIC_ROUTES.resources}
      />
    </>
  );
}
