"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { AUTH_ROUTES, settingsSectionPath } from "@/constants/routes";
import { isSettingsSection } from "@/components/dashboard/settings/settings-nav";

function RedirectSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const section = searchParams.get("section");
    if (section && isSettingsSection(section)) {
      router.replace(settingsSectionPath(section));
      return;
    }

    router.replace(AUTH_ROUTES.settingsUser);
  }, [router, searchParams]);

  return (
    <p className="text-sm text-muted-foreground">Redirecionando...</p>
  );
}

export default function ConfiguracoesPage() {
  return (
    <DashboardPage title="Configurações" subtitle="Perfil e preferências">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando...</p>
        }
      >
        <RedirectSettings />
      </Suspense>
    </DashboardPage>
  );
}
