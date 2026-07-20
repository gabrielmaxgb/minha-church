"use client";

import { useLayoutEffect, useRef } from "react";

import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Max pull in px (default 12). */
  strength?: number;
}

/** Pointer-following pull on CTAs — reset on leave. */
export function Magnetic({
  children,
  className,
  strength = 12,
}: MagneticProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const xTo = gsap.quickTo(inner, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(inner, "y", { duration: 0.35, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const relX = event.clientX - rect.left - rect.width / 2;
      const relY = event.clientY - rect.top - rect.height / 2;
      xTo((relX / rect.width) * strength);
      yTo((relY / rect.height) * strength);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      gsap.set(inner, { x: 0, y: 0 });
    };
  }, [strength]);

  return (
    <div ref={rootRef} className={cn("inline-flex", className)}>
      <div ref={innerRef} className="inline-flex will-change-transform">
        {children}
      </div>
    </div>
  );
}
