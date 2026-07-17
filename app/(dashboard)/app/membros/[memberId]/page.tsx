"use client";

import { useParams } from "next/navigation";

import { RequirePermission } from "@/components/auth/require-permission";
import { MemberDetailContent } from "@/components/dashboard/members/member-detail-content";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { useMember } from "@/lib/api/queries";
import { MEMBER_STATUS_LABELS } from "@/types/members";

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const { data: member } = useMember(memberId);

  return (
    <RequirePermission permission="members">
      <DashboardPage
        title={member?.name ?? "Membro"}
        subtitle={
          member ? MEMBER_STATUS_LABELS[member.status] : "Cadastro e histórico pastoral"
        }
      >
        <MemberDetailContent memberId={memberId} />
      </DashboardPage>
    </RequirePermission>
  );
}
