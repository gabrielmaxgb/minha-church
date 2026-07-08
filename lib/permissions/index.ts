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
  | "settings";

export function canManageMembers(permissions: UserPermissions) {
  return permissions.members.manage;
}

/**
 * Vincular/desvincular membros a ministérios e ajustar seus cargos na equipe.
 * Disponível para quem gerencia cadastros (members.manage) e também para quem
 * gerencia ministérios (ministries.manage), sem exigir CRUD dos cadastros.
 */
export function canManageMinistryMembers(permissions: UserPermissions) {
  return permissions.members.manage || permissions.ministries.manage;
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
    permissions.ministries.rosterMinistryIds.includes(ministryId)
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

export function canCreateChurchWideActivity(permissions: UserPermissions) {
  return permissions.activities.createChurchWide;
}

export function canCreateMinistryActivity(
  permissions: UserPermissions,
  ministryId: string,
) {
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
      return permissions.reports.access;
    case "settings":
      return permissions.settings.access;
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
): boolean {
  if (!item.permission) {
    return true;
  }

  return canAccessSection(permissions, item.permission);
}

export function getFirstAccessibleRoute(
  permissions: UserPermissions,
): string {
  const items = [...dashboardNavItems, ...dashboardSecondaryNavItems];

  for (const item of items) {
    if (canAccessNavItem(permissions, item)) {
      return item.href;
    }
  }

  return AUTH_ROUTES.settings;
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
  | "settings";

export function hasRoutePermission(
  permissions: UserPermissions,
  permission: RoutePermission,
) {
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
      return permissions.reports.access;
    case "settings":
      return permissions.settings.access;
    default:
      return false;
  }
}
