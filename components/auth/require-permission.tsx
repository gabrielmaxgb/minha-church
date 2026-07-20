"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { terminateSession } from "@/lib/auth/session";
import {
  getFirstAccessibleRoute,
  hasRoutePermission,
  type RoutePermission,
} from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

interface RequirePermissionProps {
  permission: RoutePermission;
  children: React.ReactNode;
}

function GateFallback({ label }: { label: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full max-w-md" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const router = useRouter();
  const { permissions, user, isLoading, isAuthenticated } = useAuth();
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
    // useRequireAuth nunca monta. Sem redirect aqui → tela branca (`return null`).
    redirectingUnauthRef.current = true;
    void terminateSession().finally(() => {
      window.location.replace(`${PUBLIC_ROUTES.login}?force=1`);
    });
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !allowed && permissions) {
      router.replace(
        getFirstAccessibleRoute(permissions, {
          isOwner: Boolean(user?.isOwner),
        }),
      );
    }
  }, [
    allowed,
    isAuthenticated,
    isLoading,
    permissions,
    router,
    user?.isOwner,
  ]);

  if (isLoading) {
    return <GateFallback label="Carregando..." />;
  }

  if (!isAuthenticated) {
    return <GateFallback label="Redirecionando..." />;
  }

  if (!allowed) {
    return <GateFallback label="Redirecionando..." />;
  }

  return children;
}
