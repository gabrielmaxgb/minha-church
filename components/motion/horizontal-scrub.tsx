"use client";

import { useLayoutEffect, useRef } from "react";

import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";
import { cn } from "@/lib/utils";

interface HorizontalScrubProps {
  children: React.ReactNode;
  className?: string;
  /** Intro block above the track (title, etc.) */
  intro?: React.ReactNode;
  /** Min card width hint for mobile stack vs desktop scrub. */
  minWidth?: "md" | "lg";
}

/**
 * Pin + horizontal scrub track (desktop/tablet).
 * Mobile: vertical stack, no pin.
 */
export function HorizontalScrub({
  children,
  className,
  intro,
}: HorizontalScrubProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const getDistance = () =>
            Math.max(0, track.scrollWidth - window.innerWidth + 48);

          gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${Math.min(Math.max(getDistance(), 600), 2000)}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("overflow-hidden border-b border-border", className)}
    >
      <div className="sm:flex sm:min-h-svh sm:flex-col sm:justify-center sm:py-16">
        {intro ? (
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            {intro}
          </div>
        ) : null}
        <div
          ref={trackRef}
          className="mt-10 flex w-max flex-col gap-4 px-4 sm:mt-12 sm:flex-row sm:gap-6 sm:px-6 lg:px-8"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
