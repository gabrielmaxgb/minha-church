export type MinistrySettingsSection =
  | "dashboard"
  | "availability"
  | "members"
  | "service-functions"
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
    id: "availability",
    label: "Escalas",
    description: "Disponibilidade e funções na equipe",
  },
  {
    id: "members",
    label: "Membros",
    description: "Equipe e cargos",
  },
  {
    id: "service-functions",
    label: "Funções",
    description: "Como a equipe pode servir",
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
