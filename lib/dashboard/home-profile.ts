import type { UserPermissions } from "@/types/auth";
import {
  canCreateAnyActivity,
  canManageMembers,
  canManageMinistries,
} from "@/lib/permissions";

export type DashboardHomeProfile = "owner" | "leader" | "member";

export function resolveDashboardHomeProfile(input: {
  isOwner: boolean;
  permissions: UserPermissions | null;
}): DashboardHomeProfile {
  if (input.isOwner) {
    return "owner";
  }

  const permissions = input.permissions;
  if (!permissions) {
    return "member";
  }

  const isLeader =
    canManageMembers(permissions) ||
    canManageMinistries(permissions) ||
    canCreateAnyActivity(permissions) ||
    permissions.memberships.manage ||
    permissions.counseling.receive ||
    permissions.communication.manage;

  return isLeader ? "leader" : "member";
}

export function homeProfileSubtitle(profile: DashboardHomeProfile): string {
  switch (profile) {
    case "owner":
      return "O que mais importa para a igreja hoje.";
    case "leader":
      return "Sua fila de cuidado com a equipe e a agenda.";
    default:
      return "Seu próximo passo nesta igreja.";
  }
}
