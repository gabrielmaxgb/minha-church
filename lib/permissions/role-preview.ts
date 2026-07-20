import type { ChurchPermissionKey, UserPermissions } from "@/types/auth";

/** UserPermissions "zerado" — base para montar previews. */
export function emptyUserPermissions(): UserPermissions {
  return {
    dashboard: { access: false },
    members: { access: false, manage: false },
    ministries: {
      access: false,
      manage: false,
      rosterMinistryIds: [],
      teamMinistryIds: [],
      rolesMinistryIds: [],
    },
    activities: { access: false, createChurchWide: false, ministryIds: [] },
    schedules: { access: false },
    finances: { access: false, manage: false },
    communication: { access: false, manage: false },
    reports: { access: false },
    settings: { access: false },
    roles: { manage: false },
    memberships: { manage: false },
    counseling: { receive: false },
    pastoralCare: { access: false },
  };
}

/**
 * Converte a lista plana de permissões de um cargo (os toggles da tela de Cargos)
 * num objeto `UserPermissions` para PRÉ-VISUALIZAÇÃO da UI.
 *
 * Porta a lógica de derivação do backend (`ChurchPermissionsService.getUserPermissions`),
 * porém de forma SIMPLIFICADA: escopos por ministério (roster/team/roles/atividades)
 * não são preenchidos com IDs — quando o cargo tem "gerenciar ministérios", o `manage`
 * já libera as ações relevantes; acessos parciais por ministério (concedidos via cargos
 * de ministério, não por este cargo de igreja) não são simulados.
 */
export function churchRolePermissionsToUserPermissions(
  keys: readonly ChurchPermissionKey[],
): UserPermissions {
  const has = (key: ChurchPermissionKey) => keys.includes(key);
  const permissions = emptyUserPermissions();

  permissions.dashboard.access = has("dashboard_access");

  permissions.members.manage = has("members_manage");
  permissions.members.access = has("members_access") || permissions.members.manage;

  permissions.ministries.manage = has("ministries_manage");
  permissions.ministries.access =
    has("ministries_access") || permissions.ministries.manage;

  permissions.activities.createChurchWide = has("events_create_church_wide");
  permissions.activities.access =
    has("activities_access") || permissions.activities.createChurchWide;

  permissions.schedules.access = has("schedules_access");

  permissions.finances.manage = has("receivables_manage");
  permissions.finances.access =
    has("finances_access") || permissions.finances.manage;

  permissions.communication.manage = has("communication_manage");
  permissions.communication.access =
    has("communication_access") || permissions.communication.manage;

  permissions.reports.access = has("reports_access");
  permissions.settings.access = has("settings_access");
  permissions.roles.manage = has("roles_manage");
  permissions.memberships.manage = has("memberships_manage");
  permissions.counseling.receive = has("counseling_receive");
  permissions.pastoralCare.access = has("pastoral_care");

  return permissions;
}
