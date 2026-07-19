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
  singleHolder: boolean;
  permissions: ChurchPermissionKey[];
}

export interface CreateChurchRolePayload {
  name: string;
  color?: string;
  sortOrder?: number;
  permissions: ChurchPermissionKey[];
  singleHolder?: boolean;
}

export interface UpdateChurchRolePayload {
  name?: string;
  color?: string | null;
  sortOrder?: number;
  permissions?: ChurchPermissionKey[];
  singleHolder?: boolean;
}

export const CHURCH_PERMISSION_LABELS: Record<ChurchPermissionKey, string> = {
  dashboard_access: "Início",
  members_access: "Membros",
  ministries_access: "Ministérios",
  activities_access: "Eventos",
  schedules_access: "Minhas escalas",
  finances_access: "Finanças",
  communication_access: "Comunicados",
  reports_access: "Relatórios",
  settings_access: "Configurações",
  members_manage: "Cadastrar e editar membros",
  ministries_manage: "Cadastrar e editar ministérios",
  events_create_church_wide: "Criar eventos em toda a igreja",
  communication_manage: "Publicar e editar comunicados",
  roles_manage: "Definir cargos da igreja",
  memberships_manage: "Atribuir cargos a usuários",
  counseling_receive: "Receber pedidos de aconselhamento e visitas",
  receivables_manage: "Gerenciar recebimentos",
};

export const CHURCH_PERMISSION_DESCRIPTIONS: Record<ChurchPermissionKey, string> = {
  dashboard_access:
    "Abre a página inicial com o essencial da semana e atalhos. Não dá acesso aos dados detalhados de cada área.",
  members_access:
    "Ver a lista de membros e abrir cada ficha (contato, ministérios e situação). Somente leitura — cadastrar ou editar exige “Cadastrar e editar membros”.",
  ministries_access:
    "Ver os ministérios, suas equipes e cargos. Somente leitura — criar ou editar exige “Cadastrar e editar ministérios”.",
  activities_access:
    "Ver a agenda e os detalhes em Eventos. Criar itens exige a permissão correspondente.",
  schedules_access:
    "Abre “Minhas escalas”, onde a pessoa acompanha as próprias convocações e marca disponibilidade.",
  finances_access:
    "Abre a área financeira da igreja (resumo de entradas e fundos).",
  communication_access:
    "Abre Comunicados, com mensagens da igreja e dos ministérios.",
  reports_access:
    "Abre os resumos e relatórios da igreja.",
  settings_access:
    "Abre as configurações da igreja (geral, cargos, usuários, atividade). Sem essa permissão, a pessoa só acessa as configurações da própria conta.",
  members_manage:
    "Cadastrar, editar e excluir membros, receber visitantes como membros e vincular ou desvincular pessoas de ministérios. Já inclui o acesso de leitura de “Membros”.",
  ministries_manage:
    "Criar, editar e excluir ministérios, seus cargos e funções, e montar as equipes vinculando ou removendo membros. Também concede controle das escalas e eventos de todos os ministérios da igreja.",
  events_create_church_wide:
    "Criar, editar e excluir eventos para toda a igreja e também eventos dentro de qualquer ministério, sem precisar liderá-lo.",
  communication_manage:
    "Criar, editar e excluir comunicados para a igreja ou ministérios específicos, agendar publicação e ver o histórico de envios.",
  roles_manage:
    "Criar, editar e excluir cargos e definir quais permissões cada um concede (esta tela). Não atribui os cargos às pessoas.",
  memberships_manage:
    "Atribuir e remover cargos dos usuários, definir proprietários, aprovar acessos pendentes e redefinir senhas de acesso.",
  counseling_receive:
    "Aparece na lista de Aconselhamentos e visitas e recebe solicitações de membros pelo app (notificação e e-mail).",
  receivables_manage:
    "Criar e gerenciar fundos de cobrança e ver o histórico de contribuições. Não inclui ativar o Stripe Connect (somente o proprietário). Já inclui o menu Finanças.",
};

export const CHURCH_PERMISSION_GROUPS: Array<{
  id: "sections" | "actions";
  label: string;
  description: string;
  permissions: ChurchPermissionKey[];
}> = [
  {
    id: "sections",
    label: "O que aparece no menu",
    description:
      "Controla as áreas visíveis no menu. Desativar uma área também remove as permissões de edição ligadas a ela.",
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
    label: "Permissões de edição",
    description:
      "Capacidades de criar e editar. Ao ativar, o acesso à área correspondente no menu é incluído automaticamente.",
    permissions: [
      "members_manage",
      "ministries_manage",
      "events_create_church_wide",
      "communication_manage",
      "roles_manage",
      "memberships_manage",
      "counseling_receive",
      "receivables_manage",
    ],
  },
];

export const ALL_CHURCH_PERMISSIONS = CHURCH_PERMISSION_GROUPS.flatMap(
  (group) => group.permissions,
);
