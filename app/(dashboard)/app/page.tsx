"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AUTH_ROUTES } from "@/constants/routes";
import { getFirstAccessibleRoute } from "@/lib/permissions";
import { useNavAccessOptions } from "@/lib/permissions/use-nav-access-options";
import { useAuth } from "@/providers/auth-provider";

export default function AppIndexPage() {
  const router = useRouter();
  const { permissions, isLoading } = useAuth();
  const navAccess = useNavAccessOptions();

  useEffect(() => {
    if (isLoading || !navAccess.isReady) {
      return;
    }

    if (permissions) {
      router.replace(
        getFirstAccessibleRoute(permissions, {
          isOwner: navAccess.isOwner,
          isActiveMember: navAccess.isActiveMember,
          isActiveAdultMember: navAccess.isActiveAdultMember,
        }),
      );
      return;
    }

    router.replace(AUTH_ROUTES.dashboard);
  }, [
    isLoading,
    navAccess.isActiveAdultMember,
    navAccess.isActiveMember,
    navAccess.isOwner,
    navAccess.isReady,
    permissions,
    router,
  ]);

  return null;
}
