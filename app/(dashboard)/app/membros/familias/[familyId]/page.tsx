"use client";

import { use } from "react";

import { RequirePermission } from "@/components/auth/require-permission";
import { FamilyGraphContent } from "@/components/dashboard/members/family-graph-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";

export default function FamilyGraphPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = use(params);

  return (
    <RequirePermission permission="members">
      <DashboardPage title="Família" subtitle="Grafo de parentesco">
        <FamilyGraphContent familyId={familyId} />
      </DashboardPage>
    </RequirePermission>
  );
}
