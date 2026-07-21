"use client";

import { useLayoutEffect, useRef } from "react";

import { ensureGsap } from "@/lib/gsap/client";
import {
  isFinePointer,
  prefersReducedMotion,
} from "@/lib/gsap/reduced-motion";
import { cn } from "@/lib/utils";

type ShapeKind = "circle" | "ring" | "square" | "diamond";

type ShapeDef = {
  kind: ShapeKind;
  className: string;
  drift: { x: number; y: number; rotate: number };
  duration: number;
  delay: number;
  depth: number;
};

/** No line strokes — they read as underlines under the headline. */
const SHAPES: ShapeDef[] = [
  {
    kind: "circle",
    className:
      "size-3.5 border border-domain-activities/35 bg-domain-activities/15 sm:size-4",
    drift: { x: 14, y: -22, rotate: 0 },
    duration: 7.5,
    delay: 0,
    depth: 28,
  },
  {
    kind: "ring",
    className:
      "size-9 border border-domain-members/30 bg-transparent sm:size-11",
    drift: { x: -18, y: 16, rotate: 25 },
    duration: 9.2,
    delay: 0.4,
    depth: 42,
  },
  {
    kind: "square",
    className:
      "size-4 rotate-12 border border-foreground/12 bg-foreground/[0.04] sm:size-5",
    drift: { x: 10, y: 18, rotate: -18 },
    duration: 8.1,
    delay: 0.8,
    depth: 22,
  },
  {
    kind: "diamond",
    className: "size-4 border border-attention/40 bg-attention/10",
    drift: { x: -12, y: -20, rotate: 40 },
    duration: 6.8,
    delay: 0.2,
    depth: 36,
  },
  {
    kind: "circle",
    className:
      "size-2 border border-domain-activities/40 bg-domain-activities/20",
    drift: { x: 16, y: 10, rotate: 0 },
    duration: 6.2,
    delay: 1.1,
    depth: 20,
  },
  {
    kind: "circle",
    className:
      "size-2.5 border border-domain-members/40 bg-domain-members/20",
    drift: { x: 8, y: -14, rotate: 0 },
    duration: 5.6,
    delay: 0.6,
    depth: 48,
  },
  {
    kind: "square",
    className:
      "hidden size-5 border border-foreground/10 bg-transparent lg:block",
    drift: { x: -16, y: 12, rotate: 15 },
    duration: 11,
    delay: 1.4,
    depth: 30,
  },
  {
    kind: "ring",
    className: "hidden size-6 border border-attention/25 sm:block",
    drift: { x: 22, y: -10, rotate: -30 },
    duration: 8.7,
    delay: 0.9,
    depth: 40,
  },
  {
    kind: "diamond",
    className:
      "hidden size-3 border border-domain-activities/35 bg-domain-activities/10 lg:block",
    drift: { x: -8, y: 24, rotate: 20 },
    duration: 7.2,
    delay: 1.6,
    depth: 52,
  },
  {
    kind: "circle",
    className:
      "size-1.5 border border-foreground/20 bg-foreground/10 sm:size-2",
    drift: { x: -12, y: 8, rotate: 0 },
    duration: 5.2,
    delay: 0.3,
    depth: 24,
  },
  {
    kind: "circle",
    className:
      "size-2 border border-attention/35 bg-attention/15 sm:size-2.5",
    drift: { x: -10, y: 16, rotate: 0 },
    duration: 6.4,
    delay: 0.5,
    depth: 34,
  },
  {
    kind: "ring",
    className: "size-5 border border-domain-activities/25 bg-transparent",
    drift: { x: 15, y: -18, rotate: 18 },
    duration: 8.3,
    delay: 1.2,
    depth: 26,
  },
  {
    kind: "square",
    className:
      "size-3 rotate-6 border border-domain-members/25 bg-domain-members/[0.06]",
    drift: { x: -20, y: 8, rotate: 12 },
    duration: 7.9,
    delay: 0.7,
    depth: 38,
  },
  {
    kind: "circle",
    className: "size-2 border border-domain-members/30 bg-domain-members/15",
    drift: { x: 11, y: -9, rotate: 0 },
    duration: 5.8,
    delay: 1.5,
    depth: 22,
  },
  {
    kind: "diamond",
    className:
      "hidden size-2.5 border border-foreground/15 bg-foreground/[0.03] sm:block",
    drift: { x: 18, y: -12, rotate: -22 },
    duration: 6.9,
    delay: 0.15,
    depth: 44,
  },
  {
    kind: "circle",
    className:
      "hidden size-3 border border-domain-activities/30 bg-domain-activities/15 lg:block",
    drift: { x: -14, y: -16, rotate: 0 },
    duration: 8.8,
    delay: 1.8,
    depth: 32,
  },
  {
    kind: "ring",
    className: "hidden size-7 border border-domain-members/20 lg:block",
    drift: { x: 10, y: 20, rotate: -14 },
    duration: 10.4,
    delay: 0.95,
    depth: 46,
  },
  {
    kind: "square",
    className:
      "hidden size-3.5 border border-attention/20 bg-attention/[0.06] lg:block",
    drift: { x: -22, y: 6, rotate: 10 },
    duration: 7.1,
    delay: 1.3,
    depth: 28,
  },
  // more bolinhas
  {
    kind: "circle",
    className: "size-1.5 bg-domain-activities/30 sm:size-2",
    drift: { x: 9, y: -11, rotate: 0 },
    duration: 4.8,
    delay: 0.25,
    depth: 36,
  },
  {
    kind: "circle",
    className: "size-2 border border-attention/25 bg-attention/10",
    drift: { x: -7, y: 13, rotate: 0 },
    duration: 5.4,
    delay: 0.85,
    depth: 30,
  },
  {
    kind: "circle",
    className: "size-1.5 border border-domain-members/35 bg-domain-members/20",
    drift: { x: 13, y: 6, rotate: 0 },
    duration: 6.1,
    delay: 1.05,
    depth: 40,
  },
  {
    kind: "circle",
    className: "size-2.5 bg-foreground/[0.06] sm:size-3",
    drift: { x: -15, y: -8, rotate: 0 },
    duration: 7.3,
    delay: 0.45,
    depth: 18,
  },
  {
    kind: "circle",
    className:
      "hidden size-2 border border-domain-activities/25 bg-domain-activities/10 sm:block",
    drift: { x: 6, y: 17, rotate: 0 },
    duration: 5.9,
    delay: 1.25,
    depth: 42,
  },
  {
    kind: "circle",
    className: "hidden size-1.5 bg-attention/25 lg:block",
    drift: { x: -11, y: 9, rotate: 0 },
    duration: 4.6,
    delay: 0.55,
    depth: 50,
  },
  {
    kind: "circle",
    className:
      "hidden size-2.5 border border-domain-members/25 bg-domain-members/10 lg:block",
    drift: { x: 17, y: -13, rotate: 0 },
    duration: 8,
    delay: 1.7,
    depth: 26,
  },
  {
    kind: "circle",
    className: "hidden size-2 bg-domain-activities/20 lg:block",
    drift: { x: -9, y: 14, rotate: 0 },
    duration: 6.7,
    delay: 0.35,
    depth: 38,
  },
];

const ANCHORS = [
  "left-[8%] top-[18%]",
  "right-[12%] top-[14%]",
  "left-[4%] bottom-[28%] sm:left-[6%]",
  "right-[6%] top-[42%] sm:right-[10%]",
  "left-[16%] top-[6%] lg:left-[20%]",
  "right-[22%] bottom-[18%]",
  "left-[78%] top-[22%]",
  "left-[12%] top-[55%] lg:top-[48%]",
  "right-[28%] top-[8%]",
  "right-[8%] bottom-[32%]",
  "left-[42%] top-[12%]",
  "right-[18%] top-[58%]",
  "left-[28%] bottom-[14%]",
  "right-[40%] bottom-[22%]",
  "left-[55%] top-[38%] sm:left-[58%]",
  "left-[70%] bottom-[12%]",
  "right-[48%] top-[28%]",
  "left-[35%] top-[68%]",
  // bolinhas
  "left-[24%] top-[32%]",
  "right-[32%] top-[48%]",
  "left-[48%] bottom-[28%]",
  "right-[16%] top-[36%]",
  "left-[62%] top-[16%]",
  "right-[52%] bottom-[16%]",
  "left-[88%] top-[48%]",
  "left-[6%] top-[40%]",
] as const;

function shapeRadius(kind: ShapeKind) {
  if (kind === "circle" || kind === "ring") {
    return "rounded-full";
  }
  if (kind === "diamond") {
    return "rounded-sm";
  }
  return "rounded-md";
}

type FloatingGeometryProps = {
  className?: string;
};

export function FloatingGeometry({ className }: FloatingGeometryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-geo-layer]"),
    );
    const shapes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-geo-shape]"),
    );

    const ctx = gsap.context(() => {
      shapes.forEach((node, index) => {
        const def = SHAPES[index];
        if (!def) {
          return;
        }

        gsap.to(node, {
          x: def.drift.x,
          y: def.drift.y,
          rotate: `+=${def.drift.rotate}`,
          duration: def.duration,
          delay: def.delay,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      if (!isFinePointer()) {
        return;
      }

      const quickTo = layers.map((layer, index) => {
        const depth = SHAPES[index]?.depth ?? 24;
        return {
          depth,
          x: gsap.quickTo(layer, "x", { duration: 0.55, ease: "power3.out" }),
          y: gsap.quickTo(layer, "y", { duration: 0.55, ease: "power3.out" }),
        };
      });

      const onMove = (event: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;

        for (const item of quickTo) {
          item.x(nx * item.depth);
          item.y(ny * item.depth);
        }
      };

      const onLeave = () => {
        for (const item of quickTo) {
          item.x(0);
          item.y(0);
        }
      };

      const target = root.parentElement ?? root;
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerleave", onLeave);
      return () => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerleave", onLeave);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {SHAPES.map((shape, index) => (
        <span
          key={`${shape.kind}-${index}`}
          data-geo-layer
          className={cn("absolute will-change-transform", ANCHORS[index])}
        >
          <span
            data-geo-shape
            className={cn(
              "absolute block will-change-transform",
              shapeRadius(shape.kind),
              shape.kind === "diamond" && "rotate-45",
              shape.className,
            )}
          />
        </span>
      ))}
    </div>
  );
}
