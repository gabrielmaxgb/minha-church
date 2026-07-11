"use client";

import { use } from "react";

import { RequirePermission } from "@/components/auth/require-permission";
import { FamilyGraphContent } from "@/components/dashboard/members/family-graph-content";

export default function FamilyGraphPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = use(params);

  return (
    <RequirePermission permission="members">
      <FamilyGraphContent familyId={familyId} />
    </RequirePermission>
  );
}
