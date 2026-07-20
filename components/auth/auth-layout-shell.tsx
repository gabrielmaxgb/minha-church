"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

import { Logo } from "@/components/layout/logo";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const header = root.querySelector("[data-auth-header]");
    const main = root.querySelector("[data-auth-main]");
    const footer = root.querySelector("[data-auth-footer]");
    const bloom = root.querySelector("[data-auth-bloom]");
    const panel = root.querySelector("[data-auth-panel]");

    const onPointer = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(bloom, {
        x: nx * 40,
        y: ny * 28,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const ctx = gsap.context(() => {
      gsap.set([header, main, footer], { opacity: 0, y: 20 });
      gsap.set(bloom, { opacity: 0, scale: 0.92 });
      if (panel) {
        gsap.set(panel, { opacity: 0, y: 28, rotateX: 4 });
      }

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(bloom, { opacity: 1, scale: 1, duration: 1.1 }, 0)
        .to(header, { opacity: 1, y: 0, duration: 0.55 }, 0.12)
        .to(main, { opacity: 1, y: 0, duration: 0.65 }, 0.2)
        .to(
          panel || main,
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.85,
            ease: "power3.out",
          },
          0.28,
        )
        .to(footer, { opacity: 1, y: 0, duration: 0.5 }, 0.4);

      root.addEventListener("pointermove", onPointer);
    }, root);

    return () => {
      root.removeEventListener("pointermove", onPointer);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="marketing-atmosphere relative flex min-h-dvh flex-col px-4 py-6 sm:px-6 sm:py-8"
      style={{ perspective: "1200px" }}
    >
      <div
        data-auth-bloom
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--attention)_14%,transparent),transparent_55%)]"
        aria-hidden
      />

      <header
        data-auth-header
        className="relative mx-auto flex w-full max-w-6xl items-center justify-center sm:justify-start"
      >
        <Logo />
      </header>

      <main
        data-auth-main
        className="relative flex flex-1 items-center justify-center py-8 sm:py-10"
      >
        <div data-auth-panel className="w-full max-w-6xl will-change-transform">
          {children}
        </div>
      </main>

      <footer
        data-auth-footer
        className="relative mx-auto flex w-full max-w-6xl justify-center pb-2 sm:justify-start"
      >
        <Link
          href={PUBLIC_ROUTES.home}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para o site
        </Link>
      </footer>
    </div>
  );
}
