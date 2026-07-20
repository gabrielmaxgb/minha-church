"use client";

import Link from "next/link";

import { securityFeatures } from "@/constants/about";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { HorizontalScrub } from "@/components/motion/horizontal-scrub";
import { MarketingPageHero } from "@/components/motion/marketing-page-hero";
import { ScrubHeadline } from "@/components/motion/scrub-headline";
import { GsapReveal } from "@/components/motion/gsap-reveal";
import { Heading } from "@/components/ui/heading";

export function SegurancaContent() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Minha Church"
        title="Seus dados estão seguros conosco"
        support="Pastores e tesoureiros confiam dados sensíveis ao Minha Church. Levamos essa responsabilidade a sério."
      />

      <HorizontalScrub
        intro={
          <div className="max-w-xl">
            <ScrubHeadline>Camadas de proteção</ScrubHeadline>
            <p className="mt-3 text-muted-foreground">
              Deslize pelas práticas que sustentam a confiança.
            </p>
          </div>
        }
      >
        {securityFeatures.map((feature, index) => (
          <article
            key={feature.title}
            className="flex w-[min(88vw,22rem)] shrink-0 flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:w-md sm:p-8"
          >
            <div>
              <span className="font-mono text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
                {feature.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </HorizontalScrub>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <GsapReveal className="max-w-2xl">
            <Heading as="h2">LGPD e privacidade</Heading>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              O Minha Church foi desenhado em linha com a Lei Geral de Proteção
              de Dados. A igreja controla quem acessa informações de membros,
              finanças e comunicação no painel. Detalhes do tratamento de dados
              estão na{" "}
              <Link
                href={PUBLIC_ROUTES.privacy}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </p>
            <Link
              href={PUBLIC_ROUTES.faq}
              className="mt-6 inline-flex text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
            >
              Ver perguntas frequentes
            </Link>
          </GsapReveal>
        </Container>
      </section>

      <CtaBanner
        title="Confiança para cuidar da sua igreja"
        description="Comece grátis e tenha a segurança que sua comunidade merece."
      />
    </>
  );
}
