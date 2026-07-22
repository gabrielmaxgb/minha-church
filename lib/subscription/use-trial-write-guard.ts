"use client";

import { useCallback, useState } from "react";

import { ROLE_PREVIEW_READ_ONLY_REASON } from "@/lib/permissions/role-preview-guard";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { toastError } from "@/lib/ui/toast";
import { useAuth } from "@/providers/auth-provider";

/**
 * Bloqueio unificado de escrita no dashboard:
 * - assinatura/trial expirado → paywall
 * - pré-visualização de cargo → somente leitura (toast, sem paywall)
 */
export function useTrialWriteGuard() {
  const { locked, reason: lockReason } = useFeatureLock();
  const { isPreviewingRole } = useAuth();
  const [paywallAction, setPaywallAction] = useState<string | null>(null);

  const writesBlocked = locked || isPreviewingRole;
  const reason = isPreviewingRole
    ? ROLE_PREVIEW_READ_ONLY_REASON
    : lockReason;

  const guardWrite = useCallback(
    (action: string, onAllowed: () => void) => {
      if (isPreviewingRole) {
        toastError(ROLE_PREVIEW_READ_ONLY_REASON);
        return;
      }

      if (locked) {
        setPaywallAction(action);
        return;
      }

      onAllowed();
    },
    [isPreviewingRole, locked],
  );

  const closePaywall = useCallback(() => {
    setPaywallAction(null);
  }, []);

  return {
    writesBlocked,
    /** True só no bloqueio de assinatura/trial — usar para paywall / LockedFeatureHint. */
    subscriptionLocked: locked,
    isRolePreview: isPreviewingRole,
    reason,
    blockProps: {
      disabled: writesBlocked,
      title: reason ?? undefined,
    } as const,
    paywallAction,
    closePaywall,
    guardWrite,
  };
}
