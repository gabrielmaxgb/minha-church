import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { legalMeta } from "@/constants/legal";
import { footerNavLinks, siteConfig } from "@/constants/navigation";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
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
