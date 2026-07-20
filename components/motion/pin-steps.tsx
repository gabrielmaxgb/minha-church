"use client";

import { useLayoutEffect, useRef } from "react";

import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";
import { cn } from "@/lib/utils";

interface PinStepsProps {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}

/**
 * Pins a stage and scrubs `[data-pin-step]` children in sequence (desktop).
 * Mobile: stacked, all visible.
 */
export function PinSteps({
  children,
  className,
  distance = 1400,
}: PinStepsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const steps = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-pin-step]"),
    );
    if (steps.length < 2) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(stage, { height: "min(70vh, 28rem)" });
          gsap.set(steps, {
            position: "absolute",
            insetInline: 0,
            top: "50%",
            yPercent: -50,
          });
          gsap.set(steps.slice(1), { opacity: 0, y: 28 });
          gsap.set(steps[0], { opacity: 1, y: 0 });
          gsap.set(progressRef.current, {
            scaleX: 0,
            transformOrigin: "left center",
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: `+=${Math.min(distance, 1800)}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          });

          tl.to(progressRef.current, { scaleX: 1, ease: "none" }, 0);

          steps.forEach((step, i) => {
            if (i === 0) return;
            const prev = steps[i - 1]!;
            const t = i / steps.length;
            tl.to(prev, { opacity: 0, y: -24, ease: "power2.in" }, t - 0.04).to(
              step,
              { opacity: 1, y: 0, ease: "power2.out" },
              t,
            );
          });
        },
      );
    }, section);

    return () => ctx.revert();
  }, [distance]);

  return (
    <section
      ref={sectionRef}
      className={cn("relative border-b border-border", className)}
    >
      <div
        ref={progressRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 origin-left scale-x-0 bg-attention md:block"
      />
      <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-16 sm:min-h-svh sm:px-6 lg:px-8">
        <div ref={stageRef} className="relative w-full space-y-16 md:space-y-0">
          {children}
        </div>
      </div>
    </section>
  );
}
