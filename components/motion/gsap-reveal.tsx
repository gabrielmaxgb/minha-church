"use client";

import { useLayoutEffect, useRef } from "react";

import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";
import { cn } from "@/lib/utils";

interface GsapRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scroll?: boolean;
}

/** Entrada com GSAP — scroll reveal nas páginas públicas. */
export function GsapReveal({
  children,
  className,
  delay = 0,
  y = 28,
  scroll = true,
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const gsap = ensureGsap();
    gsap.set(el, { opacity: 0, y });

    const tween = scroll
      ? gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        })
      : gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power3.out",
        });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, scroll, y]);

  return (
    <div ref={ref} className={cn("opacity-0", className)}>
      {children}
    </div>
  );
}

interface GsapStaggerProps {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  stagger?: number;
  y?: number;
}

/** Stagger nos filhos (cards, steps, flows). */
export function GsapStagger({
  children,
  className,
  itemSelector = ":scope > *",
  stagger = 0.1,
  y = 22,
}: GsapStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const items = el.querySelectorAll<HTMLElement>(itemSelector);
    if (!items.length) {
      return;
    }

    if (prefersReducedMotion()) {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    const gsap = ensureGsap();
    gsap.set(items, { opacity: 0, y });

    const tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 86%",
        once: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [itemSelector, stagger, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
