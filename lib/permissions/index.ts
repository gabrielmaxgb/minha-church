import type { UserPermissions } from "@/types/auth";

export type NavPermissionKey =
  | "finances"
  | "communication"
  | "reports"
  | "settings";

export function canManageMembers(permissions: UserPermissions) {
  return permissions.members.manage;
}

export function canManageMinistries(permissions: UserPermissions) {
  return permissions.ministries.manage;
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

export function canAccessNav(
  permissions: UserPermissions,
  key: NavPermissionKey,
) {
  return permissions[key].access;
}

export type RoutePermission =
  | "members.manage"
  | "ministries.manage"
  | "activities.create"
  | "finances"
  | "communication"
  | "reports"
  | "settings";

export function hasRoutePermission(
  permissions: UserPermissions,
  permission: RoutePermission,
) {
  switch (permission) {
    case "members.manage":
      return canManageMembers(permissions);
    case "ministries.manage":
      return canManageMinistries(permissions);
    case "activities.create":
      return canCreateAnyActivity(permissions);
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
