"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight } from "lucide-react";

import { resourceSections } from "@/constants/features";
import { marketingPitch } from "@/constants/marketing-pitch";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FamilyGraphPreview } from "@/components/marketing/family-graph-preview";
import {
  CareFeaturePreview,
  CommunicationFeaturePreview,
  FinancesFeaturePreview,
  SchedulesFeaturePreview,
} from "@/components/marketing/feature-previews";
import { Magnetic } from "@/components/marketing/gsap/magnetic";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import {
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-section";
import { MotionDiv } from "@/components/motion/motion-section";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/motion";
import { domainMark, domainText } from "@/lib/ui/domain-theme";
import { cn } from "@/lib/utils";

const sectionPreview: Record<
  string,
  { Preview: ComponentType<{ className?: string }>; wide?: boolean }
> = {
  membros: { Preview: FamilyGraphPreview, wide: true },
  escalas: { Preview: SchedulesFeaturePreview },
  financas: { Preview: FinancesFeaturePreview },
  comunicacao: { Preview: CommunicationFeaturePreview },
  cuidado: { Preview: CareFeaturePreview },
};

export function RecursosContent() {
  return (
    <>
      <MarketingPageHero
        title="A rotina da igreja organizada de ponta a ponta"
        support={marketingPitch.recursosHero}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Magnetic>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
            </Button>
          </Magnetic>
          <a
            href="#membros"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver fluxos
            <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </MarketingPageHero>

      <MarketingSection>
        <MarketingSectionIntro
          title="No lugar de planilhas e grupos"
          support={marketingPitch.recursosIntro}
        />

        <div className="mt-10 divide-y divide-border border-y border-border sm:mt-12">
          {resourceSections.map((section, index) => (
            <MotionDiv
              key={section.id}
              id={section.id}
              variants={fadeInUp}
              className="scroll-mt-24 grid gap-2 py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-6 sm:py-8"
            >
              <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-2">
                <span
                  className={cn("size-2 rounded-full", domainMark[section.domain])}
                  aria-hidden
                />
                <span
                  className={cn("font-mono text-sm", domainText[section.domain])}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="min-w-0 max-w-2xl">
                <h2 className="text-base font-medium text-foreground">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {section.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-foreground/80 before:mr-2 before:text-muted-foreground before:content-['·']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                {(() => {
                  const visual = sectionPreview[section.id];
                  if (!visual) {
                    return null;
                  }
                  const { Preview, wide } = visual;
                  return (
                    <div className={cn("mt-8", wide ? "max-w-3xl" : "max-w-md")}>
                      <Preview />
                    </div>
                  );
                })()}
              </div>
            </MotionDiv>
          ))}
        </div>
      </MarketingSection>

      <CtaBanner />
    </>
  );
}
