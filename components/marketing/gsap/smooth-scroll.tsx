"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ensureGsap, ScrollTrigger } from "@/lib/gsap/client";

import "lenis/dist/lenis.css";

type MarketingSmoothScrollProps = {
  children: ReactNode;
};

/** Keep Lenis and ScrollTrigger on the same raf loop. */
function LenisGsapBridge() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    ensureGsap();
    lenis.on("scroll", ScrollTrigger.update);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);

  useEffect(() => {
    if (!lenis) {
      return;
    }
    // Remeasure pin/scrub after App Router navigations.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [lenis, pathname]);

  return null;
}

/**
 * Smooth scroll for public marketing only. Skips when prefers-reduced-motion.
 * Dashboard / app shell must not wrap with this.
 */
export function MarketingSmoothScroll({ children }: MarketingSmoothScrollProps) {
  const [enabled, setEnabled] = useState(false);
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const gsap = ensureGsap();
    const tick = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  if (!enabled) {
    return children;
  }

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        anchors: true,
        lerp: 0.1,
        smoothWheel: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
