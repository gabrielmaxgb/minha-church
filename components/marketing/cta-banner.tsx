import Link from "next/link";

import { Container } from "@/components/layout/container";
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
  description = "Comece grátis hoje — sem cartão de crédito, sem instalação.",
  primaryLabel = "Começar grátis",
  primaryHref = "/planos",
  secondaryLabel,
  secondaryHref,
  className,
}: CtaBannerProps) {
  return (
    <section className={cn("py-24 sm:py-32", className)}>
      <Container>
        <div className="rounded-xl bg-foreground px-8 py-16 text-center text-background sm:px-16">
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
              <Button
                size="lg"
                variant="outline"
                className="border-background/30 bg-transparent text-background hover:bg-background/10"
                asChild
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
