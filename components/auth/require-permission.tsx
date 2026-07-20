"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { PUBLIC_ROUTES } from "@/constants/routes";
import { terminateSession } from "@/lib/auth/session";
import {
  getFirstAccessibleRoute,
  hasRoutePermission,
  type RoutePermission,
} from "@/lib/permissions";
import { useNavAccessOptions } from "@/lib/permissions/use-nav-access-options";
import { useAuth } from "@/providers/auth-provider";

interface RequirePermissionProps {
  permission: RoutePermission;
  children: React.ReactNode;
}

/** Placeholder sob a splash global — evita flash claro enquanto o host cobre. */
function GateFallback() {
  return (
    <div
      className="min-h-dvh w-full bg-white"
      aria-hidden
    />
  );
}

export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const router = useRouter();
  const { permissions, user, isLoading, isAuthenticated } = useAuth();
  const navAccess = useNavAccessOptions();
  const redirectingUnauthRef = useRef(false);

  const allowed =
    permissions !== null &&
    hasRoutePermission(permissions, permission, {
      isOwner: Boolean(user?.isOwner),
    });

  useEffect(() => {
    if (isLoading || isAuthenticated || redirectingUnauthRef.current) {
      return;
    }

    // Sem sessão: RequirePermission envolve o DashboardShell, então
    // useRequireAuth nunca monta. Sem redirect aqui → tela branca.
    redirectingUnauthRef.current = true;
    void terminateSession().finally(() => {
      window.location.replace(`${PUBLIC_ROUTES.login}?force=1`);
    });
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      !allowed &&
      permissions &&
      navAccess.isReady
    ) {
      router.replace(
        getFirstAccessibleRoute(permissions, {
          isOwner: navAccess.isOwner,
          isActiveMember: navAccess.isActiveMember,
          isActiveAdultMember: navAccess.isActiveAdultMember,
        }),
      );
    }
  }, [
    allowed,
    isAuthenticated,
    isLoading,
    navAccess.isActiveAdultMember,
    navAccess.isActiveMember,
    navAccess.isOwner,
    navAccess.isReady,
    permissions,
    router,
  ]);

  if (isLoading || (!allowed && !navAccess.isReady)) {
    return <GateFallback />;
  }

  if (!isAuthenticated) {
    return <GateFallback />;
  }

  if (!allowed) {
    return <GateFallback />;
  }

  return children;
}
