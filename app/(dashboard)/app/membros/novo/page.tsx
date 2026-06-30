"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { CreateMemberContent } from "@/components/dashboard/members/create-member-content";

export default function NovoMembroPage() {
  return (
    <RequirePermission permission="members.manage">
      <DashboardPage
        title="Adicionar membro"
        subtitle="Cadastro de visitante ou membro"
        className="max-w-3xl"
      >
        <CreateMemberContent />
      </DashboardPage>
    </RequirePermission>
  );
}
