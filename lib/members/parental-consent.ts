import { getAgeFromBirthDate } from "@/lib/care-requests/eligibility";
import type { Member } from "@/types/members";

export const PARENTAL_CONSENT_TEXT =
  "Autorizo o tratamento dos dados deste menor para gestão pastoral desta igreja no Minha Church (cadastro, escalas e comunicação operacional da comunidade).";

export function isMinorMember(
  member: Pick<Member, "birthDate" | "isMinor"> | null | undefined,
): boolean {
  if (!member) {
    return false;
  }

  if (typeof member.isMinor === "boolean") {
    return member.isMinor;
  }

  const age = getAgeFromBirthDate(member.birthDate);
  return age !== null && age < 18;
}

export function needsParentalConsentBeforeReceive(
  member: Pick<
    Member,
    | "birthDate"
    | "isMinor"
    | "parentalConsentRequired"
    | "parentalConsentGranted"
  > | null | undefined,
): boolean {
  if (!member) {
    return false;
  }

  if (typeof member.parentalConsentRequired === "boolean") {
    return member.parentalConsentRequired;
  }

  return isMinorMember(member) && !member.parentalConsentGranted;
}
