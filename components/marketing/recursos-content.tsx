"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { resourceSections } from "@/constants/features";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MotionDiv, MotionSection } from "@/components/motion/motion-section";
import { Heading } from "@/components/ui/heading";
import { fadeInUp } from "@/lib/motion";

export function RecursosContent() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-16 sm:py-20 lg:py-24">
          <MotionDiv variants={fadeInUp} className="max-w-2xl">
            <p className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              Minha Church
            </p>
            <Heading as="h1" className="mt-4 text-balance">
              Tudo para administrar sua igreja
            </Heading>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Do cadastro de membros à prestação de contas — ferramentas para a
              rotina pastoral, sem planilhas espalhadas.
            </p>
          </MotionDiv>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <div className="divide-y divide-border border-y border-border">
            {resourceSections.map((section, index) => (
              <div
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <MotionSection
                  variants={fadeInUp}
                  className="grid gap-4 py-10 sm:grid-cols-[4rem_1fr] sm:gap-10"
                >
                  <span className="font-mono text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="max-w-2xl">
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
                  </div>
                </MotionSection>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href={PUBLIC_ROUTES.register}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
            >
              Começar grátis
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
