"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CheckoutReturnHandler } from "@/components/billing/checkout-return-handler";
import { TierCrossingOwnerHost } from "@/components/billing/tier-crossing-owner-host";
import { AUTH_ROUTES } from "@/constants/routes";
import { useRequireAuth } from "@/providers/auth-provider";

/**
 * Full-viewport workspace for the family graph — no dashboard sidebar/topbar.
 * Auth and cross-cutting hosts only; the canvas owns the screen.
 */
export function FamilyGraphShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, church, user } = useRequireAuth();

  const mustChangePassword =
    Boolean(user?.mustChangePassword) && pathname !== AUTH_ROUTES.changePassword;

  useEffect(() => {
    if (!isLoading && mustChangePassword) {
      router.replace(AUTH_ROUTES.changePassword);
    }
  }, [isLoading, mustChangePassword, router]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <p className="animate-pulse text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !church || mustChangePassword) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-0 flex flex-col overflow-hidden bg-background">
        {children}
      </div>
      <Suspense fallback={null}>
        <CheckoutReturnHandler />
      </Suspense>
      <TierCrossingOwnerHost />
    </>
  );
}
