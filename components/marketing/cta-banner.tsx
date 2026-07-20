"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

import { Container } from "@/components/layout/container";
import { Magnetic } from "@/components/motion/magnetic";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";
import { splitText } from "@/lib/gsap/split-text";
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

export function CtaBanner({
  title = "Pronto para organizar sua igreja?",
  description = "30 dias grátis · Sem cartão · Sem instalação.",
  primaryLabel = "Começar grátis",
  primaryHref = PUBLIC_ROUTES.register,
  secondaryLabel,
  secondaryHref,
  className,
}: CtaBannerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const titleEl = titleRef.current;
    if (!panel || !titleEl) {
      return;
    }
    if (prefersReducedMotion()) {
      panel.style.opacity = "1";
      return;
    }

    const gsap = ensureGsap();
    const split = splitText(titleEl, "words");
    const ctx = gsap.context(() => {
      gsap.set(panel, { opacity: 0, y: 40, scale: 0.97 });
      gsap.set(split.elements, { yPercent: 110 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top 88%",
          once: true,
        },
      });

      tl.to(panel, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        ease: "power3.out",
      }).to(
        split.elements,
        {
          yPercent: 0,
          duration: 0.7,
          stagger: 0.04,
          ease: "power3.out",
        },
        0.15,
      );
    }, panel);

    return () => {
      ctx.revert();
      split.revert();
    };
  }, [title]);

  return (
    <section className={cn("py-16 sm:py-24", className)}>
      <Container>
        <div
          ref={panelRef}
          className="rounded-2xl border border-border bg-foreground px-5 py-12 text-center text-background opacity-0 sm:px-12 sm:py-14 lg:px-16"
        >
          <h2
            ref={titleRef}
            className="font-display text-xl font-semibold tracking-tight text-background sm:text-2xl leading-snug"
          >
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-background/70">
            {description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic strength={14}>
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
            </Magnetic>
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className="text-sm font-medium text-background/70 transition-colors hover:text-background"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
