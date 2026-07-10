import { Container } from "@/components/layout/container";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqList } from "@/components/marketing/faq-list";
import { Heading } from "@/components/ui/heading";
import { billingFaq, generalFaq } from "@/constants/faq";

export function FaqContent() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              Minha Church
            </p>
            <Heading as="h1" className="mt-4 text-balance">
              Perguntas frequentes
            </Heading>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Respostas para as dúvidas mais comuns sobre o produto e a
              cobrança.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <Heading as="h2">Produto</Heading>
            <div className="mt-8">
              <FaqList items={generalFaq} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <Heading as="h2">Preço e pagamento</Heading>
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
