"use client";

import { ChangePasswordContent } from "@/components/auth/change-password-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@/providers/auth-provider";

export default function ChangePasswordPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (user.mustChangePassword) {
    return <ChangePasswordContent variant="required" />;
  }

  return (
    <DashboardPage
      title="Alterar senha"
      subtitle="Atualize sua senha de acesso"
    >
      <ChangePasswordContent variant="voluntary" />
    </DashboardPage>
  );
}
