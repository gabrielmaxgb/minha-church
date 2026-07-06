import { AUTH_ROUTES, myScheduleMinistryPath } from "@/constants/routes";
import { CHURCH_WIDE_SCHEDULE_ID } from "@/lib/events/church-wide-schedule";
import type { MySchedules } from "@/types/ministries";

export function schedulePendingCount(
  schedules: MySchedules | undefined,
  hasSchedulesAccess: boolean,
): number {
  if (!hasSchedulesAccess || !schedules?.hasSchedule) {
    return 0;
  }

  return schedules.summary.pendingAvailabilityCount;
}

export function firstPendingScheduleHref(schedules: MySchedules): string {
  if ((schedules.churchWide?.pendingAvailability.length ?? 0) > 0) {
    return myScheduleMinistryPath(CHURCH_WIDE_SCHEDULE_ID);
  }

  const ministry = schedules.ministries.find(
    (item) => item.pendingAvailability.length > 0,
  );

  if (ministry) {
    return myScheduleMinistryPath(ministry.ministryId);
  }

  return AUTH_ROUTES.mySchedules;
}

export function resolveScheduleGroupName(
  schedules: MySchedules,
  ministryId: string,
): string | null {
  if (ministryId === CHURCH_WIDE_SCHEDULE_ID) {
    return schedules.churchWide?.ministryName ?? "Igreja";
  }

  return (
    schedules.ministries.find((item) => item.ministryId === ministryId)
      ?.ministryName ?? null
  );
}
