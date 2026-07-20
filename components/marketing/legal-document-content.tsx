"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

import { Container } from "@/components/layout/container";
import { MarketingPageHero } from "@/components/motion/marketing-page-hero";
import { legalMeta, type LegalSection } from "@/constants/legal";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";

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
  const articleRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const article = articleRef.current;
    if (!article || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const blocks = article.querySelectorAll<HTMLElement>("[data-legal-block]");
    const ctx = gsap.context(() => {
      gsap.from(blocks, {
        opacity: 0,
        y: 22,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: article,
          start: "top 78%",
          once: true,
        },
      });
    }, article);

    return () => ctx.revert();
  }, [sections]);

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
        display
      />

      <section className="border-b border-border py-16 sm:py-24">
        <Container>
          <article ref={articleRef} className="max-w-2xl space-y-10">
            {sections.map((section) => {
              const [lead, ...rest] = section.paragraphs;
              const hasBullets = Boolean(section.bullets?.length);

              return (
                <div
                  key={section.id}
                  id={section.id}
                  data-legal-block
                  className="scroll-mt-24"
                >
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

            <p
              data-legal-block
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
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
