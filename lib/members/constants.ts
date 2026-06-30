import type { UserRole } from "@/types/auth";

export const MEMBER_MANAGER_ROLES: UserRole[] = [
  "owner",
  "admin",
  "pastor",
  "secretary",
];

export function canManageMembers(role: UserRole | undefined) {
  return role !== undefined && MEMBER_MANAGER_ROLES.includes(role);
}
