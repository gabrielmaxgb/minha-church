import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqList } from "@/components/marketing/faq-list";
import { Heading, SectionHeader, SectionLabel } from "@/components/ui/heading";
import { billingFaq, generalFaq } from "@/constants/faq";

export function FaqContent() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>FAQ</SectionLabel>
            <Heading as="h1" className="mt-3">
              Perguntas frequentes
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Respostas para as dúvidas mais comuns sobre o Minha Church.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeader
            label="Geral"
            title="Sobre o produto"
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 max-w-2xl">
            <FaqList items={generalFaq} />
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-muted/40 py-24 sm:py-32">
        <Container>
          <SectionHeader
            label="Cobrança"
            title="Planos e pagamento"
            align="left"
            className="max-w-2xl"
          />
          <div className="mt-8 max-w-2xl">
            <FaqList items={billingFaq} />
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
