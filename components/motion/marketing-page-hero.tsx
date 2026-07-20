"use client";

import { useLayoutEffect, useRef } from "react";

import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";
import { splitText } from "@/lib/gsap/split-text";
import { cn } from "@/lib/utils";

interface MarketingPageHeroProps {
  eyebrow?: string;
  title: string;
  support: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Larger display for marketing H1s. */
  display?: boolean;
}

/** Masked word reveal + support fade — standard hero for public pages. */
export function MarketingPageHero({
  eyebrow,
  title,
  support,
  children,
  className,
  display = true,
}: MarketingPageHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const titleEl = titleRef.current;
    if (!root || !titleEl) {
      return;
    }

    if (prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const split = splitText(titleEl, "words");
    const ctx = gsap.context(() => {
      gsap.set(split.elements, { yPercent: 115 });
      gsap.set([eyebrowRef.current, supportRef.current, extraRef.current], {
        opacity: 0,
        y: 18,
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(
          split.elements,
          { yPercent: 0, duration: 0.9, stagger: 0.045 },
          0.1,
        )
        .to(supportRef.current, { opacity: 1, y: 0, duration: 0.65 }, 0.4)
        .to(extraRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0.55);
    }, root);

    return () => {
      ctx.revert();
      split.revert();
    };
  }, [title]);

  return (
    <section
      ref={rootRef}
      className={cn("border-b border-border marketing-atmosphere", className)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p
              ref={eyebrowRef}
              className="font-display text-sm font-bold tracking-tight text-foreground"
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            ref={titleRef}
            className={cn(
              "text-balance text-foreground",
              display ? "hero-display mt-3" : "mt-3 text-3xl font-bold tracking-tight sm:text-4xl",
              !eyebrow && "mt-0",
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
            <div ref={extraRef} className="mt-8">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
