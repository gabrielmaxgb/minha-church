"use client";

import { useState, type ReactNode } from "react";

import { SubscribePricingModal } from "@/components/billing/subscribe-pricing-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

interface SubscribePricingTriggerProps {
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
  /** Chamado ao abrir a modal (ex.: fechar outra modal por baixo). */
  onOpen?: () => void;
}

export function SubscribePricingTrigger({
  children,
  className,
  size = "sm",
  variant = "default",
  onOpen,
}: SubscribePricingTriggerProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user?.isOwner) {
    return null;
  }

  function handleOpen() {
    onOpen?.();
    setOpen(true);
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={handleOpen}
      >
        {children}
      </Button>
      <SubscribePricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
