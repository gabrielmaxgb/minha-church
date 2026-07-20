"use client";

import Link from "next/link";

import { securityFeatures } from "@/constants/about";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import {
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-section";
import { MotionDiv } from "@/components/motion/motion-section";
import { fadeInUp } from "@/lib/motion";

export function SegurancaContent() {
  return (
    <>
      <MarketingPageHero
        title="Seus dados estão seguros conosco"
        support="Pastores e tesoureiros confiam dados sensíveis ao Minha Church. Levamos essa responsabilidade a sério."
      />

      <MarketingSection>
        <MarketingSectionIntro
          title="Camadas de proteção"
          support="Práticas que sustentam a confiança da liderança."
        />

        <div className="mt-10 divide-y divide-border border-y border-border sm:mt-12">
          {securityFeatures.map((feature, index) => (
            <MotionDiv
              key={feature.title}
              variants={fadeInUp}
              className="grid gap-2 py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-6 sm:py-8"
            >
              <span className="font-mono text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 max-w-2xl">
                <h2 className="text-base font-medium text-foreground">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionIntro title="LGPD e privacidade">
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
        </MarketingSectionIntro>
      </MarketingSection>

      <CtaBanner
        title="Confiança para cuidar da sua igreja"
        description="Comece grátis e tenha a segurança que sua comunidade merece."
      />
    </>
  );
}
