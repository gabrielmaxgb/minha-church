"use client";

import { useLayoutEffect, useRef } from "react";

import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";
import { splitText } from "@/lib/gsap/split-text";
import { cn } from "@/lib/utils";

interface ScrubHeadlineProps {
  children: string;
  className?: string;
  as?: "h2" | "h3" | "p";
}

/** Words go from dim → full opacity tied to scroll. */
export function ScrubHeadline({
  children,
  className,
  as: Tag = "h2",
}: ScrubHeadlineProps) {
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const split = splitText(el, "words");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        split.elements,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom 45%",
            scrub: 1,
          },
        },
      );
    }, el);

    return () => {
      ctx.revert();
      split.revert();
    };
  }, [children]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn(
        "font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
