import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Roxo oficial Stripe (Blurple). */
export const STRIPE_BLURPLE = "#635BFF";

const WORDMARK_SRC = "/brand/stripe-wordmark.svg";

type WordmarkSize = "xs" | "sm" | "md";

const WORDMARK_SIZE: Record<WordmarkSize, string> = {
  /** Inline em frases — um pouco maior que o texto ao redor */
  xs: "h-[1.15em] w-auto min-h-[15px]",
  /** Botões compactos */
  sm: "h-4 w-auto",
  /** Botões / CTAs */
  md: "h-[17px] w-auto",
};

/**
 * Wordmark oficial “stripe” (substitui a palavra — não duplicar texto “Stripe”).
 */
export function StripeWordmark({
  className,
  size = "sm",
  title = "Stripe",
}: {
  className?: string;
  size?: WordmarkSize;
  title?: string | false;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- asset estático em /public
    <img
      src={WORDMARK_SRC}
      alt={title === false ? "" : title || "Stripe"}
      aria-hidden={title === false ? true : undefined}
      draggable={false}
      className={cn(
        "inline-block shrink-0 select-none object-contain object-left align-baseline",
        WORDMARK_SIZE[size],
        className,
      )}
    />
  );
}

/** @deprecated Prefer StripeWordmark — mantido como alias dos botões. */
export function StripeMark({
  className,
  title = "Stripe",
  size = "sm",
}: {
  className?: string;
  title?: string | false;
  size?: WordmarkSize;
}) {
  return <StripeWordmark className={className} title={title} size={size} />;
}

/**
 * Menção inline: só o wordmark (sem texto “Stripe” ao lado).
 */
export function StripeBrandInline({
  className,
  markClassName,
  size = "xs",
}: {
  className?: string;
  /** @deprecated Ignorado — wordmark já é a marca. */
  markClassName?: string;
  /** @deprecated Sempre wordmark; mantido por compat. */
  label?: string | false;
  size?: WordmarkSize;
}) {
  return (
    <span
      className={cn(
        "relative inline-block translate-y-[0.14em] align-baseline leading-none",
        className,
      )}
    >
      <StripeWordmark
        className={cn("align-baseline", markClassName)}
        size={size}
        title="Stripe"
      />
    </span>
  );
}

/**
 * Glyph “S” compacto — só para ícones em círculo (BusyOverlay).
 * Wordmark não cabe bem em avatar redondo.
 */
export function StripeMarkIcon({
  className,
  "aria-hidden": ariaHidden,
}: {
  className?: string;
  "aria-hidden"?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      className={cn("block size-5 shrink-0 overflow-visible text-[#635BFF]", className)}
      aria-hidden={ariaHidden ? true : undefined}
      role={ariaHidden ? undefined : "img"}
    >
      {ariaHidden ? null : <title>Stripe</title>}
      <g transform="translate(12 12) scale(0.88) translate(-12 -12)">
        <path
          fill="currentColor"
          d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.759 6.104 2.132c-1.534 1.429-2.34 3.434-2.34 5.721 0 4.582 2.785 6.576 7.267 8.213 2.72 1.01 3.61 1.866 3.61 3.075 0 1.206-.882 1.879-2.474 1.879-2.01 0-4.418-.891-6.34-2.038l-.926 5.555C7.41 23.32 10.046 24 12.944 24c2.687 0 4.839-.733 6.374-2.08 1.634-1.43 2.467-3.528 2.467-5.986 0-4.775-2.921-6.732-7.809-8.784z"
        />
      </g>
    </svg>
  );
}

export function StripeTrustLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs leading-normal text-muted-foreground",
        className,
      )}
    >
      <StripeWordmark size="xs" title={false} />
      <span>{children}</span>
    </span>
  );
}

/**
 * Botões de ação Stripe — altura fluida para não cortar o wordmark.
 */
export function stripeOutlineButtonClassName(className?: string) {
  return cn(
    "h-auto min-h-9 shrink-0 items-center gap-2 overflow-visible border-stripe-border bg-stripe-subtle px-3 py-1.5 leading-none text-foreground shadow-none hover:bg-stripe/10",
    className,
  );
}
