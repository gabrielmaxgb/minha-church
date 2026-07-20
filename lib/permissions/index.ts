import type { UserPermissions } from "@/types/auth";
import {
  dashboardNavItems,
  dashboardSecondaryNavItems,
  type DashboardNavItem,
} from "@/constants/dashboard-nav";
import { AUTH_ROUTES } from "@/constants/routes";

export type NavPermissionKey =
  | "dashboard"
  | "members"
  | "ministries"
  | "activities"
  | "schedules"
  | "finances"
  | "communication"
  | "reports"
  | "settings"
  | "pastoralCare";

export function canManageMembers(permissions: UserPermissions) {
  return permissions.members.manage;
}

/**
 * Vincular/desvincular membros a ministérios e ajustar seus cargos na equipe.
 * Disponível para quem gerencia cadastros (members.manage), quem gerencia
 * ministérios (ministries.manage), ou quem tem a permissão de equipe no
 * ministério específico.
 */
export function canManageMinistryMembers(
  permissions: UserPermissions,
  ministryId?: string,
) {
  if (permissions.members.manage || permissions.ministries.manage) {
    return true;
  }

  if (!ministryId) {
    return false;
  }

  return (permissions.ministries.teamMinistryIds ?? []).includes(ministryId);
}

export function canAccessMembers(permissions: UserPermissions | null) {
  return permissions ? canAccessSection(permissions, "members") : false;
}

export function canAccessActivities(permissions: UserPermissions | null) {
  return permissions ? canAccessSection(permissions, "activities") : false;
}

export function canAccessSchedules(permissions: UserPermissions | null) {
  return permissions ? canAccessSection(permissions, "schedules") : false;
}

export function canManageMinistries(permissions: UserPermissions) {
  return permissions.ministries.manage;
}

export function canManageMinistryRoster(
  permissions: UserPermissions,
  ministryId: string,
) {
  return (
    permissions.ministries.manage ||
    (permissions.ministries.rosterMinistryIds ?? []).includes(ministryId)
  );
}

export function canManageMinistryTeam(
  permissions: UserPermissions,
  ministryId: string,
) {
  return canManageMinistryMembers(permissions, ministryId);
}

export function canManageMinistryRoles(
  permissions: UserPermissions,
  ministryId: string,
) {
  return (
    permissions.ministries.manage ||
    (permissions.ministries.rolesMinistryIds ?? []).includes(ministryId)
  );
}

export function canListMinistries(permissions: UserPermissions | null) {
  if (!permissions) {
    return false;
  }

  return (
    canAccessSection(permissions, "ministries") ||
    canManageMinistries(permissions)
  );
}

export function canManageChurchRoles(permissions: UserPermissions) {
  return permissions.roles.manage;
}

export function canManageMemberships(permissions: UserPermissions) {
  return permissions.memberships.manage;
}

export function canManageCommunication(
  permissions: UserPermissions | null,
  isOwner = false,
) {
  return (
    isOwner || (permissions ? permissions.communication.manage : false)
  );
}

export function canCreateChurchWideActivity(permissions: UserPermissions) {
  return permissions.activities.createChurchWide;
}

export function canCreateMinistryActivity(
  permissions: UserPermissions,
  ministryId: string,
) {
  // Alinhado ao backend (`canManageMinistryEvents`): quem cria eventos da
  // igreja (owner / events_create_church_wide) pode em qualquer ministério,
  // sem depender da lista cached de ministryIds na sessão.
  if (permissions.activities.createChurchWide) {
    return true;
  }

  return permissions.activities.ministryIds.includes(ministryId);
}

export function canCreateAnyActivity(permissions: UserPermissions) {
  return (
    permissions.activities.createChurchWide ||
    permissions.activities.ministryIds.length > 0
  );
}

export function canManageEventRoster(
  permissions: UserPermissions,
  event: {
    isChurchWide: boolean;
    ministryId: string | null;
    createdByUserId: string | null;
  },
  currentUserId: string | null,
) {
  if (event.ministryId) {
    return canManageMinistryRoster(permissions, event.ministryId);
  }

  if (
    event.createdByUserId &&
    currentUserId &&
    event.createdByUserId === currentUserId
  ) {
    return true;
  }

  return canCreateChurchWideActivity(permissions);
}

export function canManageActivity(
  permissions: UserPermissions,
  event: {
    isChurchWide: boolean;
    ministryId: string | null;
    createdByUserId?: string | null;
  },
  currentUserId?: string | null,
) {
  if (event.isChurchWide) {
    if (
      event.createdByUserId &&
      currentUserId &&
      event.createdByUserId === currentUserId
    ) {
      return true;
    }

    return canCreateChurchWideActivity(permissions);
  }

  if (event.ministryId) {
    return canCreateMinistryActivity(permissions, event.ministryId);
  }

  return false;
}

export function canManageEventSettings(
  permissions: UserPermissions,
  event: {
    isChurchWide: boolean;
    ministryId: string | null;
    createdByUserId: string | null;
  },
  currentUserId: string | null,
) {
  return (
    canManageActivity(permissions, event, currentUserId) ||
    canManageEventRoster(permissions, event, currentUserId)
  );
}

export function canAccessSection(
  permissions: UserPermissions,
  key: NavPermissionKey,
): boolean {
  switch (key) {
    case "dashboard":
      return permissions.dashboard.access;
    case "members":
      return permissions.members.access;
    case "ministries":
      return permissions.ministries.access;
    case "activities":
      return permissions.activities.access;
    case "schedules":
      return permissions.schedules.access;
    case "finances":
      return permissions.finances.access;
    case "communication":
      return permissions.communication.access;
    case "reports":
      // Tesouraria também lê prestação de contas (alinha com a API).
      return (
        permissions.reports.access ||
        permissions.finances.access ||
        permissions.finances.manage
      );
    case "settings":
      return permissions.settings.access;
    case "pastoralCare":
      return permissions.pastoralCare.access;
    default:
      return false;
  }
}

/** @deprecated Use canAccessSection */
export function canAccessNav(
  permissions: UserPermissions,
  key: NavPermissionKey,
) {
  return canAccessSection(permissions, key);
}

export function canAccessNavItem(
  permissions: UserPermissions,
  item: DashboardNavItem,
  options?: {
    isActiveAdultMember?: boolean;
    isActiveMember?: boolean;
    isOwner?: boolean;
  },
): boolean {
  // Owner always has full product access — never hide nav behind role/member gates.
  if (options?.isOwner) {
    return true;
  }

  if (item.access === "activeAdultMember") {
    return Boolean(options?.isActiveAdultMember);
  }

  if (item.access === "activeMember") {
    return Boolean(options?.isActiveMember);
  }

  if (!item.permission) {
    return true;
  }

  return canAccessSection(permissions, item.permission);
}

export function getFirstAccessibleRoute(
  permissions: UserPermissions,
  options?: {
    isActiveAdultMember?: boolean;
    isActiveMember?: boolean;
    isOwner?: boolean;
  },
): string {
  const items = [...dashboardNavItems, ...dashboardSecondaryNavItems];

  for (const item of items) {
    if (canAccessNavItem(permissions, item, options)) {
      return item.href;
    }
  }

  return AUTH_ROUTES.settingsUser;
}

export type RoutePermission =
  | "dashboard"
  | "members"
  | "ministries"
  | "activities"
  | "schedules"
  | "members.manage"
  | "finances"
  | "communication"
  | "reports"
  | "settings"
  | "pastoralCare";

export function hasRoutePermission(
  permissions: UserPermissions,
  permission: RoutePermission,
  options?: { isOwner?: boolean },
) {
  if (options?.isOwner) {
    return true;
  }

  switch (permission) {
    case "dashboard":
      return permissions.dashboard.access;
    case "members":
      return permissions.members.access;
    case "ministries":
      return permissions.ministries.access;
    case "activities":
      return permissions.activities.access;
    case "schedules":
      return permissions.schedules.access;
    case "members.manage":
      return permissions.members.manage;
    case "finances":
      return permissions.finances.access;
    case "communication":
      return permissions.communication.access;
    case "reports":
      // Tesouraria também lê prestação de contas (alinha com a API).
      return (
        permissions.reports.access ||
        permissions.finances.access ||
        permissions.finances.manage
      );
    case "settings":
      return permissions.settings.access;
    case "pastoralCare":
      return permissions.pastoralCare.access;
    default:
      return false;
  }
}
