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
  members_manage: "Gerenciar membros",
  ministries_manage: "Gerenciar ministérios",
  events_create_church_wide: "Criar atividades em toda a igreja",
  finances_access: "Acessar finanças",
  communication_access: "Acessar comunicação",
  reports_access: "Acessar relatórios",
  settings_access: "Acessar configurações",
  roles_manage: "Gerenciar cargos da igreja",
  memberships_manage: "Atribuir cargos a usuários",
};

export const ALL_CHURCH_PERMISSIONS = Object.keys(
  CHURCH_PERMISSION_LABELS,
) as ChurchPermissionKey[];
