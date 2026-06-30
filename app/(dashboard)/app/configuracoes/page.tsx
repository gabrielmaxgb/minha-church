"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { ChurchMembershipsSettings } from "@/components/dashboard/settings/church-memberships-settings";
import { roleLabels } from "@/constants/dashboard-nav";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { useAuth, useTenant } from "@/providers/auth-provider";

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { church, churchId, churches } = useTenant();

  return (
    <RequirePermission permission="settings">
      <DashboardPage title="Configurações" subtitle="Igreja, usuários e preferências">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChurchMembershipsSettings />

        <section className="rounded-xl border border-border p-5">
          <h2 className="font-display text-lg font-semibold">Igreja ativa</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-medium">{church?.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">ID do tenant</dt>
              <dd className="font-mono text-xs">{churchId}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd>{church?.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Igrejas disponíveis</dt>
              <dd>{churches.map((item) => item.name).join(", ")}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border p-5">
          <h2 className="font-display text-lg font-semibold">Sua conta</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-medium">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">E-mail</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Perfil</dt>
              <dd>{user ? roleLabels[user.role] : "—"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </DashboardPage>
    </RequirePermission>
  );
}
