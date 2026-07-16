import type { Member } from "@/types/members";

export type ActiveMemberGateReason =
  | "loading"
  | "no_member"
  | "inactive"
  | "allowed";

export function isActiveMember(
  member: Pick<Member, "status"> | null | undefined,
): boolean {
  return Boolean(member && member.status === "active");
}

export function getActiveMemberGateReason(
  member: Pick<Member, "status"> | null | undefined,
  options?: { isLoading?: boolean; isError?: boolean },
): ActiveMemberGateReason {
  if (options?.isLoading) {
    return "loading";
  }

  if (options?.isError || !member) {
    return "no_member";
  }

  if (member.status !== "active") {
    return "inactive";
  }

  return "allowed";
}
