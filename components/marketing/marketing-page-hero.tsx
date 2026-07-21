"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { FloatingGeometry } from "@/components/marketing/gsap/floating-geometry";
import { ensureGsap } from "@/lib/gsap/client";
import { prefersReducedMotion } from "@/lib/gsap/reduced-motion";
import { splitWords, unsplitText } from "@/lib/gsap/split-text";
import { cn } from "@/lib/utils";

interface MarketingPageHeroProps {
  title: string;
  support: ReactNode;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Hero das páginas públicas — mesmo ritmo da home:
 * atmosfera + geometrias flutuantes + mask reveal no título.
 */
export function MarketingPageHero({
  title,
  support,
  eyebrow,
  children,
  className,
}: MarketingPageHeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const heading = titleRef.current;
    if (!heading || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const words = splitWords(heading);

    const ctx = gsap.context(() => {
      gsap.set(words, { yPercent: 110 });
      if (eyebrowRef.current) {
        gsap.set(eyebrowRef.current, { opacity: 0, y: 8 });
      }
      if (supportRef.current) {
        gsap.set(supportRef.current, { opacity: 0, y: 10 });
      }
      if (actionsRef.current) {
        gsap.set(actionsRef.current, { opacity: 0, y: 8 });
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (eyebrowRef.current) {
        tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0);
      }
      tl.to(
        words,
        {
          yPercent: 0,
          duration: 0.85,
          stagger: 0.05,
          delay: eyebrow ? 0.05 : 0.1,
        },
        0,
      )
        .to(
          supportRef.current,
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.4",
        )
        .to(
          actionsRef.current,
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.35",
        );
    }, heading.parentElement ?? heading);

    return () => {
      ctx.revert();
      unsplitText(heading);
    };
  }, [title, eyebrow]);

  return (
    <section
      className={cn(
        "marketing-atmosphere relative border-b border-border",
        className,
      )}
    >
      <FloatingGeometry />
      <Container className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p
              ref={eyebrowRef}
              className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            ref={titleRef}
            className={cn(
              "hero-display text-balance text-foreground",
              eyebrow && "mt-3",
            )}
          >
            {title}
          </h1>
          <div
            ref={supportRef}
            className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {support}
          </div>
          {children ? (
            <div ref={actionsRef} className="mt-8">
              {children}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
