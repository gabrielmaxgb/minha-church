"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { resourceSections } from "@/constants/features";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FamilyGraphPreview } from "@/components/marketing/family-graph-preview";
import { HorizontalScrub } from "@/components/motion/horizontal-scrub";
import { Magnetic } from "@/components/motion/magnetic";
import { MarketingPageHero } from "@/components/motion/marketing-page-hero";
import { ScrubHeadline } from "@/components/motion/scrub-headline";
import { Button } from "@/components/ui/button";
import { domainMark, domainSurface, domainText } from "@/lib/ui/domain-theme";
import { cn } from "@/lib/utils";

export function RecursosContent() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Minha Church"
        title="A rotina da igreja, organizada de ponta a ponta"
        support="Do primeiro contato às escalas do culto e aos comunicados da semana — fluxos que a liderança usa de verdade."
      >
        <Magnetic>
          <Button size="lg" asChild>
            <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
          </Button>
        </Magnetic>
      </MarketingPageHero>

      <HorizontalScrub
        intro={
          <div className="max-w-xl">
            <ScrubHeadline>Cada fluxo, um painel</ScrubHeadline>
            <p className="mt-3 text-muted-foreground">
              Role lateralmente — do cadastro ao comunicado.
            </p>
          </div>
        }
      >
        {resourceSections.map((section, index) => (
          <article
            key={section.id}
            id={section.id}
            className={cn(
              "flex w-[min(88vw,22rem)] shrink-0 flex-col rounded-2xl border p-6 sm:w-md sm:p-8",
              domainSurface[section.domain],
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("size-2 rounded-full", domainMark[section.domain])}
                aria-hidden
              />
              <span className={cn("font-mono text-sm", domainText[section.domain])}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {section.description}
            </p>
            <ul className="mt-6 space-y-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="text-sm text-foreground/85 before:mr-2 before:text-muted-foreground before:content-['·']"
                >
                  {item}
                </li>
              ))}
            </ul>
            {section.id === "membros" ? (
              <div className="mt-8 min-w-0">
                <FamilyGraphPreview />
              </div>
            ) : null}
          </article>
        ))}
      </HorizontalScrub>

      <section className="border-b border-border py-12">
        <Container>
          <Link
            href={PUBLIC_ROUTES.register}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
          >
            Começar grátis
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
