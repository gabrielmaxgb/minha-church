"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { ensureGsap, ScrollTrigger } from "@/lib/gsap/client";
import { prefersReducedMotion } from "@/lib/gsap/reduced-motion";
import { cn } from "@/lib/utils";

const CHAOS_CHIPS = [
  { label: "WhatsApp", x: -160, y: -110, rotate: -12 },
  { label: "Planilha", x: 130, y: -130, rotate: 8 },
  { label: "Grupo do louvor", x: -100, y: 100, rotate: 6 },
  { label: "Eventos", x: 150, y: 70, rotate: -7 },
  { label: "Escalas", x: 16, y: -48, rotate: 4 },
] as const;

type SundayChaosOrderProps = {
  copy: ReactNode;
  card: ReactNode;
  className?: string;
};

/**
 * Desktop pin+scrub: chaos chips converge away as the sunday card settles.
 * Mobile / reduced-motion: static layout, no pin.
 */
export function SundayChaosOrder({
  copy,
  card,
  className,
}: SundayChaosOrderProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLUListElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cardWrap = cardWrapRef.current;
    const chipsRoot = chipsRef.current;
    const copyEl = copyRef.current;
    if (!section || !cardWrap || !chipsRoot) {
      return;
    }
    if (prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const chipNodes = Array.from(
      chipsRoot.querySelectorAll<HTMLElement>("[data-chaos-chip]"),
    );

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(chipNodes, {
            opacity: 1,
            x: (i: number) => CHAOS_CHIPS[i]?.x ?? 0,
            y: (i: number) => CHAOS_CHIPS[i]?.y ?? 0,
            rotate: (i: number) => CHAOS_CHIPS[i]?.rotate ?? 0,
            scale: 1,
          });
          gsap.set(cardWrap, {
            opacity: 0.4,
            scale: 0.94,
            filter: "blur(2px)",
          });
          if (copyEl) {
            gsap.set(copyEl, { opacity: 0.55 });
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=1500",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          tl.to(
            chipNodes,
            {
              x: 0,
              y: 0,
              rotate: 0,
              opacity: 0,
              scale: 0.8,
              stagger: 0.035,
              ease: "power2.inOut",
            },
            0,
          )
            .to(
              cardWrap,
              {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                ease: "power2.out",
              },
              0.18,
            );

          if (copyEl) {
            tl.to(copyEl, { opacity: 1, ease: "none" }, 0.12);
          }
        },
      );
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className={cn("relative", className)}>
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 lg:px-8 lg:py-24 xl:gap-16">
        <div ref={copyRef} className="max-w-lg will-change-[opacity]">
          {copy}
        </div>

        <div className="relative min-h-0 lg:min-h-[28rem]">
          <ul
            ref={chipsRef}
            className="pointer-events-none absolute inset-0 z-20 hidden lg:block"
            aria-hidden
          >
            {CHAOS_CHIPS.map((chip) => (
              <li
                key={chip.label}
                data-chaos-chip
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border/80 bg-card/95 px-5 py-2.5 text-sm font-medium text-foreground shadow-sm will-change-transform sm:px-6 sm:py-3 sm:text-base"
              >
                {chip.label}
              </li>
            ))}
          </ul>
          <div
            ref={cardWrapRef}
            className="relative z-10 will-change-transform"
          >
            {card}
          </div>
        </div>
      </div>
    </div>
  );
}
