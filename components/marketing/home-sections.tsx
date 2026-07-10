"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { homeFeatures } from "@/constants/features";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { MotionDiv, MotionSection } from "@/components/motion/motion-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { Button } from "@/components/ui/button";
import { Heading, SectionHeader, SectionLabel } from "@/components/ui/heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

const audienceHighlights = [
  "Pastores e líderes",
  "Secretários e tesoureiros",
  "Igrejas pequenas e em crescimento",
  "Comunidades com células",
];

export function HeroSection() {
  const [showDashboard, setShowDashboard] = useState(true);

  return (
    <section className="border-b border-border">
      <Container className="py-20 sm:py-28 lg:pt-32 lg:pb-16">
        <MotionDiv
          className="mx-auto max-w-3xl text-center"
          variants={fadeInUp}
        >
          <SectionLabel>Feito para igrejas</SectionLabel>
          <Heading as="h1" className="mt-3">
            Membros, cultos, finanças e comunicação em um único sistema
          </Heading>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            A plataforma que ajuda pastores e líderes a administrar sua igreja
            sem planilhas e grupos espalhados.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={PUBLIC_ROUTES.resources}>Ver recursos</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            30 dias grátis com tudo liberado · Sem cartão · Faixas a partir de
            R$ 119/mês
          </p>
        </MotionDiv>
      </Container>

      <div className="border-t border-border bg-muted/30">
        <div className="flex justify-start items-center px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setShowDashboard((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors",
              "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-expanded={showDashboard}
            aria-controls="hero-dashboard"
          >
            {showDashboard ? (
              <>
                <EyeOff className="size-4" aria-hidden />
                Ocultar demonstração
              </>
            ) : (
              <>
                <Eye className="size-4" aria-hidden />
                Exibir demonstração
              </>
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showDashboard && (
            <motion.div
              id="hero-dashboard"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                <ProductShowcase className="w-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeader
          label="Recursos"
          title="Tudo que sua igreja precisa, de forma organizada"
          description="Ferramentas específicas para a rotina de pastores, secretários e tesoureiros."
        />

        <MotionSection
          className="mt-16 grid gap-6 sm:grid-cols-2"
          variants={staggerContainer}
        >
          {homeFeatures.map((feature) => (
            <MotionDiv key={feature.title} variants={staggerItem}>
              <Card className="h-full border-border/80 shadow-none">
                <CardHeader>
                  <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-border bg-muted">
                    <feature.icon className="size-4 text-foreground" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <ul className="mt-4 space-y-2">
                    {feature.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="size-3.5 shrink-0 text-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardHeader>
              </Card>
            </MotionDiv>
          ))}
        </MotionSection>

        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link href={PUBLIC_ROUTES.resources}>Ver todos os recursos</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

export function SocialProofSection() {
  return (
    <section className="border-y border-border bg-muted/40 py-14">
      <Container>
        <MotionSection variants={fadeInUp}>
          <p className="text-center text-sm text-muted-foreground">
            Pensado para quem administra a igreja no dia a dia
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {audienceHighlights.map((item) => (
              <span
                key={item}
                className="text-sm font-medium text-foreground/70"
              >
                {item}
              </span>
            ))}
          </div>
        </MotionSection>
      </Container>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <MotionSection
          className="rounded-xl bg-foreground px-8 py-16 text-center text-background sm:px-16"
          variants={fadeInUp}
        >
          <Heading as="h2" className="text-background">
            Sua igreja merece mais do que planilhas
          </Heading>
          <p className="mx-auto mt-4 max-w-md text-background/70">
            Teste 30 dias sem cartão. Organize membros, escalas e comunicados —
            e pague só pela faixa do tamanho da sua igreja quando continuar.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
              asChild
            >
                <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10"
              asChild
            >
              <Link href={PUBLIC_ROUTES.resources}>Ver recursos</Link>
            </Button>
          </div>
        </MotionSection>
      </Container>
    </section>
  );
}
