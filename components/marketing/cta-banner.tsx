"use client";

import Link from "next/link";

import { Container } from "@/components/layout/container";
import { MotionSection } from "@/components/motion/motion-section";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface CtaBannerProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

/** CTA final — mesmo painel escuro da home (`CtaSection`). */
export function CtaBanner({
  title = "Pronto para organizar sua igreja?",
  description = "30 dias grátis · Sem cartão · Sem instalação.",
  primaryLabel = "Começar grátis",
  primaryHref = PUBLIC_ROUTES.register,
  secondaryLabel,
  secondaryHref,
  className,
}: CtaBannerProps) {
  return (
    <section className={cn("py-14 sm:py-20", className)}>
      <Container>
        <MotionSection
          variants={fadeInUp}
          className="rounded-2xl border border-border bg-foreground px-5 py-12 text-center text-background sm:px-12 sm:py-14"
        >
          <Heading as="h2" className="text-balance text-background">
            {title}
          </Heading>
          <p className="mx-auto mt-4 max-w-md text-sm text-background/70 sm:text-base">
            {description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-full bg-background text-foreground hover:bg-background/90 sm:w-auto"
              asChild
            >
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            {secondaryLabel && secondaryHref ? (
              <Link
                href={secondaryHref}
                className="text-sm font-medium text-background/70 transition-colors hover:text-background"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </MotionSection>
      </Container>
    </section>
  );
}
