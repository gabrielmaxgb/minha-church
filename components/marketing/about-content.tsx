"use client";

import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MotionSection } from "@/components/motion/motion-section";
import { Heading, SectionHeader, SectionLabel } from "@/components/ui/heading";
import { aboutStory, team } from "@/constants/about";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { motion } from "motion/react";

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
        <Container className="py-24 sm:py-32">
          <MotionSection className="mx-auto max-w-3xl text-center" variants={fadeInUp}>
            <SectionLabel>Nossa história</SectionLabel>
            <Heading as="h1" className="mt-3">
              Por que criamos o Minha Church
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {aboutStory.origin}
            </p>
          </MotionSection>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Heading as="h2">Nossa missão</Heading>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {aboutStory.mission}
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {aboutStory.vision}
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-muted/40 py-24 sm:py-32">
        <Container>
          <SectionHeader
            label="Valores"
            title="Nossos princípios"
            description="O que guia cada decisão que tomamos."
          />

          <MotionSection
            className="mt-16 grid gap-6 md:grid-cols-3"
            variants={staggerContainer}
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={staggerItem}
                className="rounded-lg border border-border bg-background p-6"
              >
                <Heading as="h3">{value.title}</Heading>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </MotionSection>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeader
            label="Equipe"
            title="Quem está por trás"
            description="Pessoas que entendem a realidade das igrejas brasileiras."
          />

          <MotionSection
            className="mt-16 grid gap-6 sm:grid-cols-2"
            variants={staggerContainer}
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={staggerItem}
                className="rounded-lg border border-border p-6"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <Heading as="h3" className="mt-4">
                  {member.name}
                </Heading>
                <p className="text-sm font-medium text-muted-foreground">
                  {member.role}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </MotionSection>
        </Container>
      </section>

      <CtaBanner
        secondaryLabel="Ver recursos"
        secondaryHref="/recursos"
      />
    </>
  );
}
