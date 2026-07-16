"use client";

import Link from "next/link";

import { securityFeatures } from "@/constants/about";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MotionDiv, MotionSection } from "@/components/motion/motion-section";
import { Heading } from "@/components/ui/heading";
import { fadeInUp } from "@/lib/motion";

export function SegurancaContent() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-16 sm:py-20 lg:py-24">
          <MotionDiv variants={fadeInUp} className="max-w-2xl">
            <Heading as="h1" className="text-balance">
              Seus dados estão seguros conosco
            </Heading>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pastores e tesoureiros confiam dados sensíveis ao Minha Church.
              Levamos essa responsabilidade a sério.
            </p>
          </MotionDiv>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <div className="divide-y divide-border border-y border-border">
            {securityFeatures.map((feature, index) => (
              <MotionSection
                key={feature.title}
                variants={fadeInUp}
                className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="max-w-2xl">
                  <h2 className="text-base font-medium text-foreground">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </MotionSection>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <MotionSection variants={fadeInUp} className="max-w-2xl">
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
          </MotionSection>
        </Container>
      </section>

      <CtaBanner
        title="Confiança para cuidar da sua igreja"
        description="Comece grátis e tenha a segurança que sua comunidade merece."
      />
    </>
  );
}
