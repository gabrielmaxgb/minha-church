"use client";

import { billingFaq, generalFaq } from "@/constants/faq";
import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqList } from "@/components/marketing/faq-list";
import { MarketingPageHero } from "@/components/motion/marketing-page-hero";
import { ScrubHeadline } from "@/components/motion/scrub-headline";

export function FaqContent() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Minha Church"
        title="Perguntas frequentes"
        support="Respostas para as dúvidas mais comuns sobre o produto e a cobrança."
      />

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <ScrubHeadline as="h2" className="text-2xl sm:text-3xl">
              Produto
            </ScrubHeadline>
            <div className="mt-8">
              <FaqList items={generalFaq} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <ScrubHeadline as="h2" className="text-2xl sm:text-3xl">
              Preço e pagamento
            </ScrubHeadline>
            <div className="mt-8">
              <FaqList items={billingFaq} />
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
