/**
 * Tarifas e docs públicos do Stripe Brasil.
 * Conferir periodicamente — contas com preço customizado podem divergir.
 */

export const STRIPE_BR_DOCS = {
  about: {
    href: "https://stripe.com/br/about",
    label: "O que é o Stripe",
  },
  pricing: {
    href: "https://stripe.com/br/pricing",
    label: "Preços e tarifas",
  },
  localPaymentMethods: {
    href: "https://stripe.com/br/pricing/local-payment-methods",
    label: "Pix, boleto e meios locais",
  },
  connectPricing: {
    href: "https://stripe.com/br/connect/pricing",
    label: "Preços do Connect",
  },
  balancesSettlement: {
    href: "https://docs.stripe.com/payments/balances",
    label: "Saldos e prazo de liquidação",
  },
  payouts: {
    href: "https://docs.stripe.com/payouts",
    label: "Repasses ao banco",
  },
  pix: {
    href: "https://docs.stripe.com/payments/pix",
    label: "Pagamentos com Pix",
  },
  boleto: {
    href: "https://docs.stripe.com/payments/boleto",
    label: "Pagamentos com boleto",
  },
} as const;

/** @deprecated Prefer STRIPE_BR_DOCS.pricing.href */
export const STRIPE_BR_PRICING_URL = STRIPE_BR_DOCS.pricing.href;

export const STRIPE_BR_PUBLIC_FEES = {
  cardDomestic: {
    label: "Cartão nacional",
    summary: "3,99% + R$ 0,39",
  },
  cardInternational: {
    label: "Cartão internacional",
    summary: "+ 2%",
  },
  pix: {
    label: "Pix",
    summary: "1,19%",
  },
  boleto: {
    label: "Boleto",
    summary: "R$ 3,45 por boleto pago",
  },
} as const;

/** Texto curto para UI — plataforma zero + processador cobra. */
export const PLATFORM_FEE_TRANSPARENCY =
  "Minha Church não adiciona taxa por transação neste momento.";
