"use client";

import { MembersContent } from "@/components/dashboard/members-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function MembrosPage() {
  return (
    <DashboardPage title="Membros" subtitle="Cadastro e histórico pastoral">
      <MembersContent />
    </DashboardPage>
  );
}
