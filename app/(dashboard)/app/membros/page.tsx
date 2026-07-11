"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { MembersContent } from "@/components/dashboard/members-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function MembrosPage() {
  return (
    <RequirePermission permission="members">
      <DashboardPage title="Membros" subtitle="Cadastro e histórico pastoral">
        <MembersContent />
      </DashboardPage>
    </RequirePermission>
  );
}
