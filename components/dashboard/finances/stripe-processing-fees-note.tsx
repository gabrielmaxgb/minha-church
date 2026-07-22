"use client";

import { ExternalLink } from "lucide-react";

import { StripeBrandInline } from "@/components/brand/stripe-mark";
import {
  PLATFORM_FEE_TRANSPARENCY,
  STRIPE_BR_DOCS,
  STRIPE_BR_PUBLIC_FEES,
} from "@/constants/stripe-fees-br";
import { cn } from "@/lib/utils";

function StripeDocLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-2 hover:text-primary"
    >
      {children}
      <ExternalLink className="size-3 shrink-0 opacity-60" aria-hidden />
    </a>
  );
}

/**
 * Bloco de transparência: taxa zero da plataforma + tarifas públicas do Stripe.
 */
export function StripeProcessingFeesNote({
  className,
  compact = false,
}: {
  className?: string;
  /** Só o essencial (ex.: tip abaixo dos cards de repasse). */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "space-y-1.5 text-xs leading-relaxed text-muted-foreground",
          className,
        )}
      >
        <p>
          Os valores em Contribuições são o que a pessoa pagou (bruto). Em
          liquidação e no banco entra o líquido após a tarifa do{" "}
          <StripeBrandInline />. {PLATFORM_FEE_TRANSPARENCY}
        </p>
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          <StripeDocLink href={STRIPE_BR_DOCS.pricing.href}>
            {STRIPE_BR_DOCS.pricing.label}
          </StripeDocLink>
          <StripeDocLink href={STRIPE_BR_DOCS.balancesSettlement.href}>
            {STRIPE_BR_DOCS.balancesSettlement.label}
          </StripeDocLink>
          <StripeDocLink href={STRIPE_BR_DOCS.payouts.href}>
            {STRIPE_BR_DOCS.payouts.label}
          </StripeDocLink>
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-domain-finances/25 bg-domain-finances-subtle/70 px-4 py-3.5",
        className,
      )}
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium leading-snug text-domain-finances-foreground">
          O que é o <StripeBrandInline />?
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          É a empresa que processa Pix, cartão e boleto e envia o valor para a
          conta bancária da igreja. O Minha Church não guarda esse dinheiro —
          só conecta a igreja ao <StripeBrandInline />.{" "}
          <StripeDocLink href={STRIPE_BR_DOCS.about.href}>
            {STRIPE_BR_DOCS.about.label}
          </StripeDocLink>
        </p>
      </div>

      <div className="space-y-1 border-t border-domain-finances/20 pt-3">
        <p className="text-sm font-medium leading-snug text-domain-finances-foreground">
          {PLATFORM_FEE_TRANSPARENCY}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          A tarifa do <StripeBrandInline /> sai do valor antes de chegar ao
          banco. Bruto (o que a pessoa pagou) ≠ líquido (o que a igreja
          recebe).
        </p>
      </div>

      <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">
            {STRIPE_BR_PUBLIC_FEES.cardDomestic.label}:
          </span>{" "}
          {STRIPE_BR_PUBLIC_FEES.cardDomestic.summary}
          <span className="text-muted-foreground/80">
            {" "}
            ({STRIPE_BR_PUBLIC_FEES.cardInternational.summary} no internacional)
          </span>
        </li>
        <li>
          <span className="font-medium text-foreground">
            {STRIPE_BR_PUBLIC_FEES.pix.label}:
          </span>{" "}
          {STRIPE_BR_PUBLIC_FEES.pix.summary}
        </li>
        <li>
          <span className="font-medium text-foreground">
            {STRIPE_BR_PUBLIC_FEES.boleto.label}:
          </span>{" "}
          {STRIPE_BR_PUBLIC_FEES.boleto.summary}
        </li>
      </ul>

      <div className="space-y-1.5 border-t border-domain-finances/20 pt-3">
        <p className="text-xs font-medium text-foreground">
          Documentação do <StripeBrandInline />
        </p>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
          <li>
            <StripeDocLink href={STRIPE_BR_DOCS.about.href}>
              {STRIPE_BR_DOCS.about.label}
            </StripeDocLink>
          </li>
          <li>
            <StripeDocLink href={STRIPE_BR_DOCS.pricing.href}>
              {STRIPE_BR_DOCS.pricing.label}
            </StripeDocLink>
          </li>
          <li>
            <StripeDocLink href={STRIPE_BR_DOCS.localPaymentMethods.href}>
              {STRIPE_BR_DOCS.localPaymentMethods.label}
            </StripeDocLink>
          </li>
          <li>
            <StripeDocLink href={STRIPE_BR_DOCS.connectPricing.href}>
              {STRIPE_BR_DOCS.connectPricing.label}
            </StripeDocLink>
          </li>
          <li>
            <StripeDocLink href={STRIPE_BR_DOCS.balancesSettlement.href}>
              {STRIPE_BR_DOCS.balancesSettlement.label}
            </StripeDocLink>
          </li>
          <li>
            <StripeDocLink href={STRIPE_BR_DOCS.payouts.href}>
              {STRIPE_BR_DOCS.payouts.label}
            </StripeDocLink>
          </li>
          <li>
            <StripeDocLink href={STRIPE_BR_DOCS.pix.href}>
              {STRIPE_BR_DOCS.pix.label}
            </StripeDocLink>
          </li>
          <li>
            <StripeDocLink href={STRIPE_BR_DOCS.boleto.href}>
              {STRIPE_BR_DOCS.boleto.label}
            </StripeDocLink>
          </li>
        </ul>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Tabela pública padrão. Conta com preço customizado pode divergir; o
          valor cobrado na transação aparece no painel do{" "}
          <StripeBrandInline />.
        </p>
      </div>
    </div>
  );
}
