import type { Member } from "@/types/members";

const ADULT_AGE = 18;

export function getAgeFromBirthDate(
  birthDate: string | Date | null | undefined,
  referenceDate = new Date(),
): number | null {
  if (!birthDate) {
    return null;
  }

  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function isActiveAdultMember(
  member: Pick<Member, "status" | "birthDate"> | null | undefined,
): boolean {
  if (!member || member.status !== "active") {
    return false;
  }

  const age = getAgeFromBirthDate(member.birthDate);

  return age !== null && age >= ADULT_AGE;
}

export type ActiveAdultGateReason =
  | "loading"
  | "no_member"
  | "inactive"
  | "missing_birth_date"
  | "underage"
  | "allowed";

export function getActiveAdultGateReason(
  member: Pick<Member, "status" | "birthDate"> | null | undefined,
  options?: { isLoading?: boolean; isError?: boolean },
): ActiveAdultGateReason {
  if (options?.isLoading) {
    return "loading";
  }

  if (options?.isError || !member) {
    return "no_member";
  }

  if (member.status !== "active") {
    return "inactive";
  }

  if (!member.birthDate) {
    return "missing_birth_date";
  }

  const age = getAgeFromBirthDate(member.birthDate);

  if (age === null || age < ADULT_AGE) {
    return "underage";
  }

  return "allowed";
}
