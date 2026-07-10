import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

interface CtaBannerProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

export function CtaBanner({
  title = "Pronto para organizar sua igreja?",
  description = "30 dias grátis · Sem cartão · Sem instalação.",
  primaryLabel = "Começar grátis",
  primaryHref = PUBLIC_ROUTES.register,
  secondaryLabel,
  secondaryHref,
  className,
}: CtaBannerProps) {
  return (
    <section className={cn("py-16 sm:py-24", className)}>
      <Container>
        <div className="rounded-2xl border border-border bg-foreground px-5 py-12 text-center text-background sm:px-12 sm:py-14 lg:px-16">
          <Heading as="h2" className="text-background">
            {title}
          </Heading>
          <p className="mx-auto mt-4 max-w-md text-background/70">{description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
              asChild
            >
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className="text-sm font-medium text-background/70 transition-colors hover:text-background"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
