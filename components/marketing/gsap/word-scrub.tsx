"use client";

import { useLayoutEffect, useRef } from "react";

import { ensureGsap, ScrollTrigger } from "@/lib/gsap/client";
import { prefersReducedMotion } from "@/lib/gsap/reduced-motion";
import { splitWords, unsplitText } from "@/lib/gsap/split-text";
import { cn } from "@/lib/utils";

type WordScrubProps = {
  children: string;
  as?: "h2" | "p" | "span";
  className?: string;
};

/**
 * Editorial word scrub: opacity 0.12 → 1 tied to scroll.
 * Skips animation when prefers-reduced-motion.
 */
export function WordScrub({
  children,
  as: Tag = "p",
  className,
}: WordScrubProps) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const words = splitWords(el);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            end: "bottom 42%",
            scrub: 1,
          },
        },
      );
    }, el);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
      unsplitText(el);
    };
  }, [children]);

  return (
    <Tag
      ref={(node) => {
        ref.current = node;
      }}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
