import type { UserPermissions } from "@/types/auth";

export function canManageChurchMemberships(
  permissions: UserPermissions | null | undefined,
) {
  return permissions?.memberships.manage ?? false;
}
