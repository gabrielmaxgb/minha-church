import type { ChurchPermissionKey } from "@/types/auth";

export type { ChurchPermissionKey } from "@/types/auth";

export interface ChurchRole {
  id: string;
  churchId: string;
  name: string;
  color?: string;
  sortOrder: number;
  isSystem: boolean;
  systemKey?: string;
  permissions: ChurchPermissionKey[];
}

export interface CreateChurchRolePayload {
  name: string;
  color?: string;
  sortOrder?: number;
  permissions: ChurchPermissionKey[];
}

export interface UpdateChurchRolePayload {
  name?: string;
  color?: string | null;
  sortOrder?: number;
  permissions?: ChurchPermissionKey[];
}

export const CHURCH_PERMISSION_LABELS: Record<ChurchPermissionKey, string> = {
  dashboard_access: "Dashboard",
  members_access: "Membros",
  ministries_access: "Ministérios",
  activities_access: "Atividades",
  schedules_access: "Minhas escalas",
  finances_access: "Finanças",
  communication_access: "Comunicação",
  reports_access: "Relatórios",
  settings_access: "Configurações",
  members_manage: "Gerenciar membros",
  ministries_manage: "Gerenciar ministérios",
  events_create_church_wide: "Criar atividades em toda a igreja",
  roles_manage: "Gerenciar cargos da igreja",
  memberships_manage: "Atribuir cargos a usuários",
};

export const CHURCH_PERMISSION_DESCRIPTIONS: Record<ChurchPermissionKey, string> = {
  dashboard_access: "Vê o resumo e indicadores na página inicial.",
  members_access: "Acessa a lista e as fichas de membros.",
  ministries_access: "Navega pelos ministérios e equipes.",
  activities_access: "Vê eventos e encontros da igreja.",
  schedules_access: "Acessa escalas e disponibilidade.",
  finances_access: "Entra na área financeira da igreja.",
  communication_access: "Acessa avisos e comunicações.",
  reports_access: "Consulta relatórios e indicadores.",
  settings_access: "Abre configurações gerais da igreja.",
  members_manage: "Cria, edita e remove cadastros pastorais.",
  ministries_manage: "Cria ministérios, cargos e equipes.",
  events_create_church_wide: "Publica atividades para toda a igreja.",
  roles_manage: "Edita cargos e suas permissões.",
  memberships_manage: "Define cargos e proprietários dos usuários.",
};

export const CHURCH_PERMISSION_GROUPS: Array<{
  id: "sections" | "actions";
  label: string;
  description: string;
  permissions: ChurchPermissionKey[];
}> = [
  {
    id: "sections",
    label: "Acesso às seções",
    description: "Controla o que aparece no menu lateral para quem tem este cargo.",
    permissions: [
      "dashboard_access",
      "members_access",
      "ministries_access",
      "activities_access",
      "schedules_access",
      "finances_access",
      "communication_access",
      "reports_access",
      "settings_access",
    ],
  },
  {
    id: "actions",
    label: "Ações administrativas",
    description:
      "Capacidades extras além de visualizar — criar, editar e gerenciar recursos.",
    permissions: [
      "members_manage",
      "ministries_manage",
      "events_create_church_wide",
      "roles_manage",
      "memberships_manage",
    ],
  },
];

export const ALL_CHURCH_PERMISSIONS = CHURCH_PERMISSION_GROUPS.flatMap(
  (group) => group.permissions,
);
