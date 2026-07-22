"use client";

import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { StripeBrandInline, StripeMarkIcon } from "@/components/brand/stripe-mark";
import { BusyOverlay } from "@/components/ui/busy-overlay";
import { Button } from "@/components/ui/button";
import { useSubscribeCheckout } from "@/lib/billing/use-subscribe-checkout";
import type { BillingPeriod } from "@/types";

interface SubscribeCheckoutButtonProps {
  interval?: BillingPeriod;
  children: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
}

export function SubscribeCheckoutButton({
  interval = "monthly",
  children,
  className,
  size = "sm",
  variant = "default",
}: SubscribeCheckoutButtonProps) {
  const { subscribe, loading, canSubscribe } = useSubscribeCheckout();

  if (!canSubscribe) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch gap-1">
      <BusyOverlay
        active={loading}
        variant="fullscreen"
        icon={StripeMarkIcon}
        steps={[
          "Abrindo o checkout seguro...",
          <>
            Redirecionando ao <StripeBrandInline />
            ...
          </>,
        ]}
        hint="Você será levado à página de pagamento em instantes."
      />
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        disabled={loading}
        onClick={() => void subscribe(interval)}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Abrindo checkout…
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
