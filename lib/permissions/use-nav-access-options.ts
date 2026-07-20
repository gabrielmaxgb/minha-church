"use client";

import { useMyMember } from "@/lib/api/queries";
import { isActiveAdultMember } from "@/lib/care-requests/eligibility";
import { isActiveMember } from "@/lib/members/active-member-eligibility";
import { useAuth } from "@/providers/auth-provider";

/**
 * Flags usados por `canAccessNavItem` / `getFirstAccessibleRoute`.
 * Owner libera tudo; demais usuários dependem da ficha pastoral.
 */
export function useNavAccessOptions() {
  const { user } = useAuth();
  const isOwner = Boolean(user?.isOwner);
  const myMember = useMyMember({
    enabled: Boolean(user) && !isOwner,
  });

  return {
    isOwner,
    isActiveMember: isOwner || isActiveMember(myMember.data),
    isActiveAdultMember: isOwner || isActiveAdultMember(myMember.data),
    /** false enquanto a ficha ainda carrega (não-owner). */
    isReady: isOwner || !user || !myMember.isLoading,
  };
}
