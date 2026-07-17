"use client";

import { useParams } from "next/navigation";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { MyScheduleMinistryContent } from "@/components/dashboard/my-schedule/my-schedule-ministry-content";
import { useMySchedules } from "@/lib/api/queries";
import { resolveScheduleGroupName } from "@/lib/my-schedule/schedule-notifications";

export default function MyScheduleMinistryPage() {
  const params = useParams();
  const ministryId = params.ministryId as string;
  const { data } = useMySchedules();
  const ministryName = data
    ? resolveScheduleGroupName(data, ministryId)
    : null;

  return (
    <RequirePermission permission="schedules">
      <DashboardPage
        title={ministryName ?? "Minhas escalas"}
        subtitle="Calendário, disponibilidade e escalas confirmadas"
      >
        <MyScheduleMinistryContent ministryId={ministryId} />
      </DashboardPage>
    </RequirePermission>
  );
}
