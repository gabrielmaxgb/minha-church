export type MinistrySettingsSection =
  | "dashboard"
  | "availability"
  | "events"
  | "members"
  | "service-functions"
  | "overview"
  | "roles"
  | "advanced";

export type MinistrySettingsGroup = "dia-a-dia" | "organizacao" | "avancado";

export const MINISTRY_SETTINGS_GROUPS: Array<{
  id: MinistrySettingsGroup;
  label: string;
}> = [
  { id: "dia-a-dia", label: "Dia a dia" },
  { id: "organizacao", label: "Organização" },
  { id: "avancado", label: "Avançado" },
];

export const MINISTRY_SETTINGS_SECTIONS: Array<{
  id: MinistrySettingsSection;
  group: MinistrySettingsGroup;
  label: string;
  description: string;
}> = [
  {
    id: "dashboard",
    group: "dia-a-dia",
    label: "Painel",
    description: "Resumo e atalhos",
  },
  {
    id: "availability",
    group: "dia-a-dia",
    label: "Escalas",
    description: "Disponibilidade e montagem da equipe",
  },
  {
    id: "events",
    group: "dia-a-dia",
    label: "Eventos",
    description: "Cultos, ensaios e agendas",
  },
  {
    id: "members",
    group: "dia-a-dia",
    label: "Equipe",
    description: "Pessoas deste ministério",
  },
  {
    id: "service-functions",
    group: "organizacao",
    label: "Funções na escala",
    description: "Como a equipe serve neste grupo",
  },
  {
    id: "overview",
    group: "organizacao",
    label: "Visão geral",
    description: "Nome, descrição e status",
  },
  {
    id: "roles",
    group: "organizacao",
    label: "Cargos de liderança",
    description: "Quem administra e suas permissões",
  },
  {
    id: "advanced",
    group: "avancado",
    label: "Avançado",
    description: "Ações irreversíveis",
  },
];
