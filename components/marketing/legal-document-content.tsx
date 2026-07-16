import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Heading } from "@/components/ui/heading";
import { legalMeta, type LegalSection } from "@/constants/legal";
import { PUBLIC_ROUTES } from "@/constants/routes";

type LegalDocumentContentProps = {
  title: string;
  description: string;
  sections: LegalSection[];
  relatedHref: string;
  relatedLabel: string;
};

export function LegalDocumentContent({
  title,
  description,
  sections,
  relatedHref,
  relatedLabel,
}: LegalDocumentContentProps) {
  return (
    <>
      <section className="border-b border-border">
        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Atualizado em {legalMeta.lastUpdatedLabel}
            </p>
            <Heading as="h1" className="mt-3 text-balance">
              {title}
            </Heading>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
            <p className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              Prestador: {legalMeta.legalName} — CNPJ {legalMeta.cnpj}. Este
              texto ainda merece revisão jurídica antes de ser considerado
              definitivo.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <article className="max-w-2xl space-y-10">
            {sections.map((section) => {
              const [lead, ...rest] = section.paragraphs;
              const hasBullets = Boolean(section.bullets?.length);

              return (
                <div key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {hasBullets ? (
                      <>
                        {lead ? <p>{lead}</p> : null}
                        <ul className="list-disc space-y-2 pl-5">
                          {section.bullets!.map((item, index) => (
                            <li key={`${section.id}-b-${index}`}>{item}</li>
                          ))}
                        </ul>
                        {rest.map((paragraph, index) => (
                          <p key={`${section.id}-p-${index}`}>{paragraph}</p>
                        ))}
                      </>
                    ) : (
                      section.paragraphs.map((paragraph, index) => (
                        <p key={`${section.id}-p-${index}`}>{paragraph}</p>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

            <p className="border-t border-border pt-8 text-sm text-muted-foreground">
              Veja também:{" "}
              <Link
                href={relatedHref}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {relatedLabel}
              </Link>
              {" · "}
              <Link
                href={PUBLIC_ROUTES.security}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Segurança
              </Link>
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
