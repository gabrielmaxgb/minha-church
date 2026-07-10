import type { ChurchPermissionKey } from "@/types/church-roles";
import { CHURCH_PERMISSION_LABELS } from "@/types/church-roles";

/** Ação administrativa que exige acesso à seção correspondente no menu. */
export const ACTION_REQUIRES_SECTION_ACCESS: Partial<
  Record<ChurchPermissionKey, ChurchPermissionKey>
> = {
  members_manage: "members_access",
  ministries_manage: "ministries_access",
  events_create_church_wide: "activities_access",
  communication_manage: "communication_access",
  roles_manage: "settings_access",
  memberships_manage: "settings_access",
};

/** Ao desligar a seção, estas ações administrativas também são removidas. */
export const SECTION_ACCESS_IMPLIES_ACTIONS: Partial<
  Record<ChurchPermissionKey, ChurchPermissionKey[]>
> = {
  members_access: ["members_manage"],
  ministries_access: ["ministries_manage"],
  activities_access: ["events_create_church_wide"],
  communication_access: ["communication_manage"],
  settings_access: ["roles_manage", "memberships_manage"],
};

export function expandLinkedSectionAccess(
  permissions: readonly ChurchPermissionKey[],
): ChurchPermissionKey[] {
  const next = new Set(permissions);

  for (const permission of permissions) {
    const section = ACTION_REQUIRES_SECTION_ACCESS[permission];

    if (section) {
      next.add(section);
    }
  }

  return [...next];
}

export function getLinkedActionsForSection(
  section: ChurchPermissionKey,
  permissions: readonly ChurchPermissionKey[],
): ChurchPermissionKey[] {
  const linked = SECTION_ACCESS_IMPLIES_ACTIONS[section] ?? [];

  return linked.filter((action) => permissions.includes(action));
}

export function isSectionAccessRequiredByActions(
  section: ChurchPermissionKey,
  permissions: readonly ChurchPermissionKey[],
): boolean {
  return getLinkedActionsForSection(section, permissions).length > 0;
}

export function getSectionIncludedByLabel(
  section: ChurchPermissionKey,
  permissions: readonly ChurchPermissionKey[],
): string | null {
  const linked = getLinkedActionsForSection(section, permissions);

  if (linked.length === 0) {
    return null;
  }

  return linked.map((action) => CHURCH_PERMISSION_LABELS[action]).join(", ");
}

export function getSectionDisableWarning(
  section: ChurchPermissionKey,
  permissions: readonly ChurchPermissionKey[],
): string | null {
  const linked = getLinkedActionsForSection(section, permissions);

  if (linked.length === 0) {
    return null;
  }

  const actionLabels = linked
    .map((action) => CHURCH_PERMISSION_LABELS[action])
    .join(", ");

  return `Desativar "${CHURCH_PERMISSION_LABELS[section]}" também remove: ${actionLabels}.`;
}

export function applyChurchPermissionToggle(
  permissions: readonly ChurchPermissionKey[],
  permission: ChurchPermissionKey,
): ChurchPermissionKey[] {
  const enabled = permissions.includes(permission);

  if (enabled) {
    let next = permissions.filter((item) => item !== permission);

    const linkedActions = SECTION_ACCESS_IMPLIES_ACTIONS[permission];

    if (linkedActions) {
      next = next.filter((item) => !linkedActions.includes(item));
    }

    return next;
  }

  return expandLinkedSectionAccess([...permissions, permission]);
}

export function applyChurchPermissionGroupToggle(
  permissions: readonly ChurchPermissionKey[],
  groupPermissions: readonly ChurchPermissionKey[],
  enabled: boolean,
): ChurchPermissionKey[] {
  if (enabled) {
    return expandLinkedSectionAccess([
      ...new Set([...permissions, ...groupPermissions]),
    ]);
  }

  const groupSet = new Set(groupPermissions);

  return permissions.filter((permission) => {
    if (groupSet.has(permission)) {
      return false;
    }

    const requiredSection = ACTION_REQUIRES_SECTION_ACCESS[permission];

    if (requiredSection && groupSet.has(requiredSection)) {
      return false;
    }

    return true;
  });
}
