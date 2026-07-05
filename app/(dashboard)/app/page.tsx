"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AUTH_ROUTES } from "@/constants/routes";
import { getFirstAccessibleRoute } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

export default function AppIndexPage() {
  const router = useRouter();
  const { permissions, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (permissions) {
      router.replace(getFirstAccessibleRoute(permissions));
      return;
    }

    router.replace(AUTH_ROUTES.dashboard);
  }, [isLoading, permissions, router]);

  return null;
}
