"use client";

import type { ReactNode } from "react";

import { FloatingGeometry } from "@/components/marketing/gsap/floating-geometry";

/** Atmosphere + floating geometry for login/cadastro shells. */
export function AuthAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-atmosphere relative flex min-h-dvh flex-col px-4 py-6 sm:px-6 sm:py-8">
      <FloatingGeometry />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--attention)_12%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
