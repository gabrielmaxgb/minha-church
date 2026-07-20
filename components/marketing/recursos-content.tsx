"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { resourceSections } from "@/constants/features";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FamilyGraphPreview } from "@/components/marketing/family-graph-preview";
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

export function RecursosContent() {
  return (
    <>
      <MarketingPageHero
        title="A rotina da igreja, organizada de ponta a ponta"
        support="Do primeiro contato às escalas do culto e aos comunicados da semana — fluxos que a liderança usa de verdade."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
          </Button>
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
          support="Cada fluxo do dia a dia da igreja, no mesmo lugar."
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
                {section.id === "membros" ? (
                  <div className="mt-8 max-w-3xl">
                    <FamilyGraphPreview />
                  </div>
                ) : null}
              </div>
            </MotionDiv>
          ))}
        </div>
      </MarketingSection>

      <CtaBanner />
    </>
  );
}
