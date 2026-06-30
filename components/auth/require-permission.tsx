"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import {
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
  const { permissions, isLoading, isAuthenticated } = useAuth();

  const allowed =
    permissions !== null && hasRoutePermission(permissions, permission);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !allowed) {
      router.replace(AUTH_ROUTES.dashboard);
    }
  }, [allowed, isAuthenticated, isLoading, router]);

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
