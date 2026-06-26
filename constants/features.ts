import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  MessageSquare,
  Users,
  Wallet,
} from "lucide-react";

export interface FeatureHighlight {
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
}

export const homeFeatures: FeatureHighlight[] = [
  {
    title: "Gestão de membros",
    description: "Toda a sua comunidade organizada, do cadastro ao acompanhamento pastoral.",
    icon: Users,
    items: ["Cadastro completo", "Histórico pastoral", "Controle de presença"],
  },
  {
    title: "Cultos e eventos",
    description: "Planeje cultos, eventos e escalas sem depender de planilhas.",
    icon: Calendar,
    items: ["Agenda de cultos", "Escalas de voluntários", "Confirmação de presença"],
  },
  {
    title: "Finanças",
    description: "Transparência total no controle financeiro da igreja.",
    icon: Wallet,
    items: ["Dízimos e ofertas", "Relatórios mensais", "Prestação de contas"],
  },
  {
    title: "Comunicação",
    description: "Mantenha líderes e membros alinhados em um só canal.",
    icon: MessageSquare,
    items: ["Avisos por e-mail", "Comunicados segmentados", "Histórico de mensagens"],
  },
];

export const resourceSections = [
  {
    id: "membros",
    title: "Gestão de membros",
    description:
      "Cadastre e acompanhe cada membro com histórico pastoral, dados de contato e controle de presença em cultos e eventos.",
    items: [
      "Cadastro completo com dados pessoais e familiares",
      "Histórico pastoral e anotações confidenciais",
      "Controle de presença por culto ou evento",
      "Importação em massa via planilha",
      "Segmentação por ministério ou célula",
    ],
  },
  {
    id: "cultos",
    title: "Cultos e eventos",
    description:
      "Organize a agenda da igreja, monte escalas e acompanhe a participação da comunidade.",
    items: [
      "Calendário de cultos e eventos especiais",
      "Escalas de louvor, recepção e mídia",
      "Confirmação de voluntários",
      "Check-in de participantes",
      "Relatório de frequência",
    ],
  },
  {
    id: "escalas",
    title: "Escalas de voluntários",
    description:
      "Distribua responsabilidades de forma clara e evite conflitos de agenda.",
    items: [
      "Escalas por ministério",
      "Notificação automática aos voluntários",
      "Substituições e confirmações",
      "Histórico de serviços",
    ],
  },
  {
    id: "financas",
    title: "Finanças",
    description:
      "Registre entradas e saídas, gere relatórios e facilite a prestação de contas.",
    items: [
      "Registro de dízimos e ofertas",
      "Categorias de despesas",
      "Relatórios mensais e anuais",
      "Exportação para contabilidade",
      "Prestação de contas para liderança",
    ],
  },
  {
    id: "comunicacao",
    title: "Comunicação",
    description:
      "Envie avisos e comunicados para toda a igreja ou grupos específicos.",
    items: [
      "Comunicados por e-mail",
      "Segmentação por ministério ou faixa etária",
      "Templates de mensagens",
      "Histórico de envios",
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios",
    description:
      "Visualize dados da igreja em dashboards claros para tomada de decisão.",
    items: [
      "Dashboard com indicadores principais",
      "Relatório de membros ativos",
      "Relatório financeiro consolidado",
      "Exportação em PDF e Excel",
    ],
    icon: BarChart3,
  },
];
