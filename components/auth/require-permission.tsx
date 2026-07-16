"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
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

export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const router = useRouter();
  const { permissions, user, isLoading, isAuthenticated } = useAuth();

  const allowed =
    permissions !== null &&
    hasRoutePermission(permissions, permission, {
      isOwner: Boolean(user?.isOwner),
    });

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
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return children;
}
