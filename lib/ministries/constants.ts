export type MinistrySettingsSection =
  | "dashboard"
  | "availability"
  | "events"
  | "members"
  | "service-functions"
  | "overview"
  | "roles"
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
    description: "Disponibilidade e montagem da equipe",
  },
  {
    id: "events",
    label: "Eventos e atividades",
    description: "Cultos, ensaios e agendas",
  },
  {
    id: "members",
    label: "Membros",
    description: "Equipe, cargos e funções",
  },
  {
    id: "service-functions",
    label: "Funções na escala",
    description: "Como a equipe serve neste grupo",
  },
  {
    id: "overview",
    label: "Visão geral",
    description: "Nome, descrição e status",
  },
  {
    id: "roles",
    label: "Cargos de liderança",
    description: "Quem administra e suas permissões",
  },
  {
    id: "advanced",
    label: "Avançado",
    description: "Ações irreversíveis",
  },
];
