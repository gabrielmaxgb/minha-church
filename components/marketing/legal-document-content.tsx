"use client";

import Link from "next/link";

import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { MotionDiv } from "@/components/motion/motion-section";
import { legalMeta, type LegalSection } from "@/constants/legal";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { fadeInUp } from "@/lib/motion";

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
      <MarketingPageHero
        eyebrow={`Atualizado em ${legalMeta.lastUpdatedLabel}`}
        title={title}
        support={
          <>
            {description}
            <span className="mt-4 block rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              Prestador: {legalMeta.legalName} — CNPJ {legalMeta.cnpj}. Este
              texto ainda merece revisão jurídica antes de ser considerado
              definitivo.
            </span>
          </>
        }
      />

      <MarketingSection noBorder>
        <article className="max-w-2xl space-y-10">
          {sections.map((section) => {
            const [lead, ...rest] = section.paragraphs;
            const hasBullets = Boolean(section.bullets?.length);

            return (
              <MotionDiv
                key={section.id}
                id={section.id}
                variants={fadeInUp}
                className="scroll-mt-24"
              >
                <h2 className="text-base font-medium text-foreground">
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
              </MotionDiv>
            );
          })}

          <MotionDiv
            variants={fadeInUp}
            className="border-t border-border pt-8 text-sm text-muted-foreground"
          >
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
          </MotionDiv>
        </article>
      </MarketingSection>
    </>
  );
}
