"use client";

import { Container } from "@/components/layout/container";
import { MotionDiv } from "@/components/motion/motion-section";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MarketingPageHeroProps {
  title: string;
  support: React.ReactNode;
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
}

/** Hero das páginas públicas — mesmo ritmo da home (`marketing-atmosphere` + `hero-display`). */
export function MarketingPageHero({
  title,
  support,
  eyebrow,
  children,
  className,
}: MarketingPageHeroProps) {
  return (
    <section
      className={cn("marketing-atmosphere border-b border-border", className)}
    >
      <Container className="py-12 sm:py-16 lg:py-20">
        <MotionDiv variants={fadeInUp} className="max-w-2xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "hero-display text-balance text-foreground",
              eyebrow && "mt-3",
            )}
          >
            {title}
          </h1>
          <div className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {support}
          </div>
          {children ? <div className="mt-8">{children}</div> : null}
        </MotionDiv>
      </Container>
    </section>
  );
}
