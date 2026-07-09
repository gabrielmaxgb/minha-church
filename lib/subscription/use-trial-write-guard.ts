"use client";

import { useCallback, useState } from "react";

import { useFeatureLock } from "@/lib/subscription/use-feature-lock";

/** Props úteis para desabilitar botões de escrita quando o trial expirou. */
export function useTrialWriteGuard() {
  const { locked, reason } = useFeatureLock();
  const [paywallAction, setPaywallAction] = useState<string | null>(null);

  const guardWrite = useCallback(
    (action: string, onAllowed: () => void) => {
      if (locked) {
        setPaywallAction(action);
        return;
      }

      onAllowed();
    },
    [locked],
  );

  const closePaywall = useCallback(() => {
    setPaywallAction(null);
  }, []);

  return {
    writesBlocked: locked,
    reason,
    blockProps: {
      disabled: locked,
      title: reason ?? undefined,
    } as const,
    paywallAction,
    closePaywall,
    guardWrite,
  };
}
