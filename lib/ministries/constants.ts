import type { UserRole } from "@/types/auth";

export const MINISTRY_MANAGER_ROLES: UserRole[] = ["owner", "admin", "pastor"];

export const MINISTRY_EVENT_MANAGER_ROLES: UserRole[] = [
  "owner",
  "admin",
  "pastor",
];

export function canManageMinistries(role: UserRole | undefined) {
  return role !== undefined && MINISTRY_MANAGER_ROLES.includes(role);
}

export function canManageMinistryEvents(role: UserRole | undefined) {
  return role !== undefined && MINISTRY_EVENT_MANAGER_ROLES.includes(role);
}

export type MinistrySettingsSection =
  | "dashboard"
  | "members"
  | "overview"
  | "roles"
  | "permissions"
  | "advanced";

export const MINISTRY_SETTINGS_SECTIONS: Array<{
  id: MinistrySettingsSection;
  label: string;
  description: string;
}> = [
  {
    id: "dashboard",
    label: "Painel",
    description: "Resumo e atalhos",
  },
  {
    id: "members",
    label: "Membros",
    description: "Equipe e cargos",
  },
  {
    id: "overview",
    label: "Visão geral",
    description: "Nome, descrição e status",
  },
  {
    id: "roles",
    label: "Cargos",
    description: "Estrutura de papéis",
  },
  {
    id: "permissions",
    label: "Permissões",
    description: "Quem gerencia eventos",
  },
  {
    id: "advanced",
    label: "Avançado",
    description: "Ações irreversíveis",
  },
];
