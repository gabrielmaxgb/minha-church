import type { UserRole } from "@/types/auth";

const ALL_ROLES: UserRole[] = [
  "owner",
  "admin",
  "pastor",
  "secretary",
  "treasurer",
  "leader",
  "member",
];

const ASSIGNABLE_ROLES: Record<UserRole, UserRole[]> = {
  owner: ALL_ROLES,
  admin: ["pastor", "secretary", "treasurer", "leader", "member"],
  pastor: ["secretary", "treasurer", "leader", "member"],
  secretary: [],
  treasurer: [],
  leader: [],
  member: [],
};

export function canManageChurchMemberships(role: UserRole | undefined) {
  return role === "owner" || role === "admin" || role === "pastor";
}

export function getAssignableRoles(actorRole: UserRole): UserRole[] {
  return ASSIGNABLE_ROLES[actorRole] ?? [];
}

export function canModifyMembership(
  actorRole: UserRole,
  targetRole: UserRole,
  targetUserId: string,
  actorUserId: string,
) {
  if (targetUserId === actorUserId) {
    return false;
  }

  if (actorRole === "owner") {
    return true;
  }

  if (actorRole === "admin") {
    return !["owner", "admin"].includes(targetRole);
  }

  if (actorRole === "pastor") {
    return !["owner", "admin", "pastor"].includes(targetRole);
  }

  return false;
}

export function getEditableRolesForTarget(
  actorRole: UserRole,
  targetRole: UserRole,
  targetUserId: string,
  actorUserId: string,
): UserRole[] {
  if (!canModifyMembership(actorRole, targetRole, targetUserId, actorUserId)) {
    return [];
  }

  return getAssignableRoles(actorRole);
}
