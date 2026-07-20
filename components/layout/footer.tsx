"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { legalMeta } from "@/constants/legal";
import {
  footerMobileOnlyLinks,
  footerNavLinks,
  siteConfig,
} from "@/constants/navigation";
import { ensureGsap, prefersReducedMotion } from "@/lib/gsap/client";

export function Footer() {
  const year = new Date().getFullYear();
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      return;
    }

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(root.children, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: root,
          start: "top 92%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={rootRef} className="border-t border-border bg-muted/40">
      <Container className="py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <Logo size="md" />
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {siteConfig.tagline}
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            {footerNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {footerMobileOnlyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Separator className="my-8" />

        <p className="text-sm text-muted-foreground">
          © {year} {siteConfig.name}. Todos os direitos reservados.
          <span className="mt-1 block text-xs sm:mt-0 sm:ml-1 sm:inline">
            {legalMeta.legalName} · CNPJ {legalMeta.cnpj}
          </span>
        </p>
      </Container>
    </footer>
  );
}
