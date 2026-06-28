"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import { securityFeatures } from "@/constants/about";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MotionSection } from "@/components/motion/motion-section";
import { Button } from "@/components/ui/button";
import { Heading, SectionHeader, SectionLabel } from "@/components/ui/heading";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { motion } from "motion/react";

export function SegurancaContent() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-24 sm:py-32">
          <MotionSection className="mx-auto max-w-3xl text-center" variants={fadeInUp}>
            <SectionLabel>Segurança</SectionLabel>
            <Heading as="h1" className="mt-3">
              Seus dados estão seguros conosco
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Pastores e tesoureiros confiam dados sensíveis ao Minha Church.
              Levamos essa responsabilidade a sério.
            </p>
          </MotionSection>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <MotionSection
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
          >
            {securityFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className="rounded-lg border border-border p-6"
              >
                <Shield className="size-5 text-foreground" strokeWidth={1.5} />
                <Heading as="h3" className="mt-4">
                  {feature.title}
                </Heading>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </MotionSection>
        </Container>
      </section>

      <section className="border-t border-border bg-muted/40 py-24 sm:py-32">
        <Container>
          <SectionHeader
            label="LGPD"
            title="Conformidade e privacidade"
            description="Estamos em conformidade com a Lei Geral de Proteção de Dados. Você controla quem acessa informações de membros, finanças e comunicação."
            align="left"
            className="max-w-3xl"
          />
          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link href={PUBLIC_ROUTES.faq}>Ver perguntas frequentes</Link>
            </Button>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Confiança para cuidar da sua igreja"
        description="Comece grátis e tenha a segurança que sua comunidade merece."
      />
    </>
  );
}
