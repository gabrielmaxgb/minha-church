"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { resourceSections } from "@/constants/features";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MotionSection } from "@/components/motion/motion-section";
import { Button } from "@/components/ui/button";
import { Heading, SectionLabel } from "@/components/ui/heading";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { motion } from "motion/react";

export function RecursosContent() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-24 sm:py-32">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <SectionLabel>Recursos</SectionLabel>
            <Heading as="h1" className="mt-3">
              Tudo para administrar sua igreja
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Ferramentas específicas para cada área da gestão eclesiástica —
              do cadastro de membros à prestação de contas financeira.
            </p>
          </motion.div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <MotionSection className="space-y-20" variants={staggerContainer}>
            {resourceSections.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                variants={staggerItem}
                className="grid gap-8 lg:grid-cols-2 lg:items-start"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <Heading as="h2">{section.title}</Heading>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <ul
                  className={`space-y-3 rounded-lg border border-border p-6 ${index % 2 === 1 ? "lg:order-1" : ""}`}
                >
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </MotionSection>

          <div className="mt-16 text-center">
            <Button asChild>
              <Link href="/preco">Começar grátis</Link>
            </Button>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
