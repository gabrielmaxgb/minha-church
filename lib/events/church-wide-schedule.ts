export const CHURCH_WIDE_SCHEDULE_ID = "igreja";

export function isChurchWideScheduleId(ministryId: string | null): boolean {
  return ministryId === CHURCH_WIDE_SCHEDULE_ID;
}
