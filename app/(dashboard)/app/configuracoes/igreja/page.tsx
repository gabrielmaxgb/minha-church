"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { SettingsContent } from "@/components/dashboard/settings/settings-content";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

function ChurchSettingsPageContent() {
  const router = useRouter();
  const { permissions, user, isLoading } = useAuth();
  const allowed =
    Boolean(user?.isOwner) || Boolean(permissions?.settings.access);

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace(AUTH_ROUTES.settingsUser);
    }
  }, [allowed, isLoading, router]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <DashboardPage
      title="Configurações da igreja"
      subtitle="Assinatura, recebimentos, cargos e acesso"
    >
      <SettingsContent area="church" />
    </DashboardPage>
  );
}

export default function ConfiguracoesIgrejaPage() {
  return (
    <Suspense
      fallback={
        <DashboardPage
          title="Configurações da igreja"
          subtitle="Assinatura, recebimentos, cargos e acesso"
        >
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </DashboardPage>
      }
    >
      <ChurchSettingsPageContent />
    </Suspense>
  );
}
