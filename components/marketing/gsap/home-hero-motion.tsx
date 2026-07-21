"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Magnetic } from "@/components/marketing/gsap/magnetic";
import { Button } from "@/components/ui/button";
import { homeHero } from "@/constants/home";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { ensureGsap } from "@/lib/gsap/client";
import { prefersReducedMotion } from "@/lib/gsap/reduced-motion";
import { splitWords, unsplitText } from "@/lib/gsap/split-text";
import { cn } from "@/lib/utils";

type HomeHeroMotionProps = {
  className?: string;
  mobilePreview?: ReactNode;
};

/**
 * Hero copy with mask word reveal, magnetic primary CTA, bloom parallax.
 */
export function HomeHeroMotion({
  className,
  mobilePreview,
}: HomeHeroMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const supportRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bloomARef = useRef<HTMLDivElement>(null);
  const bloomBRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) {
      return;
    }

    const gsap = ensureGsap();
    const reduced = prefersReducedMotion();

    if (reduced) {
      return;
    }

    const words = splitWords(title);
    const ctx = gsap.context(() => {
      gsap.set(words, { yPercent: 110 });
      if (supportRef.current) {
        gsap.set(supportRef.current, { opacity: 0, y: 12 });
      }
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { opacity: 0, y: 10 });
      }

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(words, {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.055,
          delay: 0.12,
        })
        .to(
          supportRef.current,
          { opacity: 1, y: 0, duration: 0.65 },
          "-=0.45",
        )
        .to(
          ctaRef.current,
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.4",
        );

      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
        () => {
          const blooms = [bloomARef.current, bloomBRef.current].filter(
            Boolean,
          ) as HTMLElement[];
          if (blooms.length === 0) {
            return;
          }

          const onMove = (event: PointerEvent) => {
            const rect = root.getBoundingClientRect();
            const nx = (event.clientX - rect.left) / rect.width - 0.5;
            const ny = (event.clientY - rect.top) / rect.height - 0.5;
            gsap.to(bloomARef.current, {
              x: nx * 28,
              y: ny * 18,
              duration: 0.9,
              ease: "power2.out",
              overwrite: "auto",
            });
            gsap.to(bloomBRef.current, {
              x: nx * -18,
              y: ny * 22,
              duration: 1.05,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          root.addEventListener("pointermove", onMove);
          return () => root.removeEventListener("pointermove", onMove);
        },
      );
    }, root);

    return () => {
      ctx.revert();
      unsplitText(title);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        ref={bloomARef}
        className="pointer-events-none absolute -left-16 -top-24 size-64 rounded-full bg-domain-activities/15 blur-3xl will-change-transform lg:size-80"
        aria-hidden
      />
      <div
        ref={bloomBRef}
        className="pointer-events-none absolute -right-10 top-8 size-52 rounded-full bg-domain-members/12 blur-3xl will-change-transform lg:size-72"
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
        <h1
          ref={titleRef}
          className="hero-display text-balance text-foreground"
        >
          {homeHero.headline}
        </h1>
        <p
          ref={supportRef}
          className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {homeHero.support}
        </p>
        <div
          ref={ctaRef}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
        >
          <Magnetic>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href={PUBLIC_ROUTES.register}>{homeHero.primaryCta}</Link>
            </Button>
          </Magnetic>
          <a
            href={homeHero.secondaryHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {homeHero.secondaryCta}
            <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {homeHero.trialNote}
        </p>
      </div>

      {mobilePreview}
    </div>
  );
}
