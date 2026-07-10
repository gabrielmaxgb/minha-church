"use client";

import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MotionDiv, MotionSection } from "@/components/motion/motion-section";
import { Heading } from "@/components/ui/heading";
import { aboutStory } from "@/constants/about";
import { PUBLIC_ROUTES } from "@/constants/routes";
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
];

export function AboutContent() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-16 sm:py-20 lg:py-24">
          <MotionDiv variants={fadeInUp} className="max-w-2xl">
            <p className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              Minha Church
            </p>
            <Heading as="h1" className="mt-4 text-balance">
              Por que criamos o Minha Church
            </Heading>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {aboutStory.origin}
            </p>
          </MotionDiv>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <MotionSection variants={fadeInUp} className="max-w-2xl">
            <Heading as="h2">Missão</Heading>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {aboutStory.mission}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {aboutStory.vision}
            </p>
          </MotionSection>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <MotionSection variants={fadeInUp} className="max-w-2xl">
            <Heading as="h2">Princípios</Heading>
            <p className="mt-3 text-muted-foreground">
              O que guia cada decisão que tomamos.
            </p>
          </MotionSection>

          <div className="mt-12 divide-y divide-border border-y border-border">
            {values.map((value, index) => (
              <MotionDiv
                key={value.title}
                variants={fadeInUp}
                className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-base font-medium text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </Container>
      </section>

      <CtaBanner
        secondaryLabel="Ver recursos"
        secondaryHref={PUBLIC_ROUTES.resources}
      />
    </>
  );
}
