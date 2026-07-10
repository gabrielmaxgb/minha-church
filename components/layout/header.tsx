"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { mainNavLinks } from "@/constants/navigation";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Logo />

          <nav className="hidden items-center gap-6 md:flex">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  pathname === link.href
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href={PUBLIC_ROUTES.login}>Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={PUBLIC_ROUTES.register}>Começar grátis</Link>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-t border-border py-3 md:hidden">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 px-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={PUBLIC_ROUTES.login} onClick={() => setMobileOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={PUBLIC_ROUTES.register} onClick={() => setMobileOpen(false)}>
                  Começar grátis
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </Container>
    </header>
  );
}
