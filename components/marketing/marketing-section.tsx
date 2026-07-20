"use client";

import { Container } from "@/components/layout/container";
import { MotionSection } from "@/components/motion/motion-section";
import { Heading } from "@/components/ui/heading";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MarketingSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Fundo suave como a FAQ de preços. */
  muted?: boolean;
  /** Sem borda inferior (última seção antes do CTA). */
  noBorder?: boolean;
}

/** Seção padrão das páginas públicas — padding e borda iguais à home. */
export function MarketingSection({
  children,
  className,
  id,
  muted,
  noBorder,
}: MarketingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-14 sm:py-20",
        !noBorder && "border-b border-border",
        muted && "bg-muted/30",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

interface MarketingSectionIntroProps {
  title: string;
  support?: React.ReactNode;
  eyebrow?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Intro de seção — Heading + suporte, no estilo da home. */
export function MarketingSectionIntro({
  title,
  support,
  eyebrow,
  className,
  children,
}: MarketingSectionIntroProps) {
  return (
    <MotionSection variants={fadeInUp} className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <Heading as="h2" className={cn("text-balance", eyebrow && "mt-3")}>
        {title}
      </Heading>
      {support ? (
        <div className="mt-3 text-muted-foreground">{support}</div>
      ) : null}
      {children}
    </MotionSection>
  );
}
