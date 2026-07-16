import { loadStripe, type Stripe } from "@stripe/stripe-js";

export const GIVING_PRESET_REAIS = [20, 50, 100, 200, 500] as const;

/** Stripe iframes não herdam next/font — carrega DM Sans igual ao app. */
export const STRIPE_ELEMENTS_FONTS = [
  {
    cssSrc:
      "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap",
  },
] as const;

export const STRIPE_ELEMENTS_APPEARANCE = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#2f5a43",
    colorBackground: "#ffffff",
    colorText: "#141413",
    colorTextSecondary: "#6f6f6a",
    colorTextPlaceholder: "#6f6f6a",
    colorDanger: "#8f4444",
    borderRadius: "8px",
    fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    fontSizeBase: "14px",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "600",
  },
  rules: {
    ".Label": {
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      fontSize: "14px",
      fontWeight: "500",
    },
    ".Input": {
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
    ".Tab": {
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
    ".TabLabel": {
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
  },
};

export function formatBrlFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

type StripeCacheKey = string;
const stripePromises = new Map<StripeCacheKey, Promise<Stripe | null>>();

export function getGivingStripe(
  publishableKey: string,
  stripeAccountId: string,
): Promise<Stripe | null> {
  const key = `${publishableKey}:${stripeAccountId}`;
  let promise = stripePromises.get(key);
  if (!promise) {
    promise = loadStripe(publishableKey, { stripeAccount: stripeAccountId });
    stripePromises.set(key, promise);
  }
  return promise;
}
