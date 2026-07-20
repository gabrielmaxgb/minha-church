"use client";

import { billingFaq, generalFaq } from "@/constants/faq";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqList } from "@/components/marketing/faq-list";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import {
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-section";
import { MotionDiv } from "@/components/motion/motion-section";
import { fadeInUp } from "@/lib/motion";

export function FaqContent() {
  return (
    <>
      <MarketingPageHero
        title="Perguntas frequentes"
        support="Respostas para as dúvidas mais comuns sobre o produto e a cobrança."
      />

      <MarketingSection>
        <MarketingSectionIntro title="Produto" />
        <MotionDiv variants={fadeInUp} className="mt-8 max-w-2xl">
          <FaqList items={generalFaq} />
        </MotionDiv>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionIntro title="Preço e pagamento" />
        <MotionDiv variants={fadeInUp} className="mt-8 max-w-2xl">
          <FaqList items={billingFaq} />
        </MotionDiv>
      </MarketingSection>

      <CtaBanner />
    </>
  );
}
