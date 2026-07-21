"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { ensureGsap } from "@/lib/gsap/client";
import {
  isFinePointer,
  prefersReducedMotion,
} from "@/lib/gsap/reduced-motion";
import { cn } from "@/lib/utils";

const MAX_PULL = 12;

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Soften pull on coarse/touch — typically disabled. */
  strength?: number;
};

/**
 * Pointer lerp ≤ 12px toward cursor; resets on leave.
 * Off when reduced-motion or no fine pointer.
 */
export function Magnetic({
  children,
  className,
  strength = 1,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current =
      !prefersReducedMotion() && isFinePointer() && strength > 0;
  }, [strength]);

  const onMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabledRef.current) {
      return;
    }
    const node = ref.current;
    if (!node) {
      return;
    }
    const gsap = ensureGsap();
    const rect = node.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (event.clientX - cx) / (rect.width / 2);
    const dy = (event.clientY - cy) / (rect.height / 2);
    const max = MAX_PULL * strength;
    gsap.to(node, {
      x: Math.max(-max, Math.min(max, dx * max)),
      y: Math.max(-max, Math.min(max, dy * max)),
      duration: 0.35,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, [strength]);

  const onLeave = useCallback(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const gsap = ensureGsap();
    gsap.to(node, {
      x: 0,
      y: 0,
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, []);

  return (
    <div
      ref={ref}
      className={cn("inline-flex will-change-transform", className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}
