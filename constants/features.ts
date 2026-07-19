import type { LucideIcon } from "lucide-react";
import {
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

/** Fluxos do dia a dia — usado em recursos e referências internas. */
export const homeFeatures: FeatureHighlight[] = [
  {
    title: "Do primeiro contato ao acompanhamento pastoral",
    description:
      "Cadastre visitantes e membros, registre o histórico e saiba quem está ativo na comunidade.",
    icon: Users,
    items: [
      "Cadastro pastoral",
      "Grafo de família",
      "Histórico de status e vínculos",
      "Status ativo, visitante ou inativo",
    ],
  },
  {
    title: "Convide voluntários e feche a escala",
    description:
      "Peça disponibilidade, acompanhe respostas e monte a equipe do culto com antecedência.",
    icon: Calendar,
    items: [
      "Agenda de cultos e eventos",
      "Convocação e confirmação",
      "Escala oficial por função",
    ],
  },
  {
    title: "Avise a igreja com histórico",
    description:
      "Comunicados para toda a igreja ou por ministério — sem depender de grupos de WhatsApp.",
    icon: MessageSquare,
    items: [
      "Comunicados segmentados",
      "Registro do que foi publicado",
      "Leitura pela equipe",
    ],
  },
];

export const resourceSections = [
  {
    id: "membros",
    domain: "members" as const,
    title: "Do primeiro contato ao acompanhamento pastoral",
    description:
      "Cadastre e acompanhe cada pessoa com histórico pastoral, contato e status — a referência da comunidade.",
    items: [
      "Cadastro com dados pessoais e de contato",
      "Grafo de família com vínculos de parentesco",
      "Histórico de status, datas e vínculos ministeriais",
      "Status: visitante, ativo ou inativo",
      "Vínculo com ministérios e cargos",
      "Importação a partir de planilha",
    ],
  },
  {
    id: "cultos",
    domain: "activities" as const,
    title: "Agenda da igreja e do ministério",
    description:
      "Planeje cultos e encontros, com visibilidade para quem precisa da agenda do dia.",
    items: [
      "Calendário de cultos e eventos",
      "Eventos da igreja e por ministério",
      "Local, horário e recorrência",
      "Detalhe do evento com escala e comunicados",
    ],
  },
  {
    id: "escalas",
    domain: "schedules" as const,
    title: "Convide, confirme e feche a escala",
    description:
      "Distribua funções com clareza e saiba quem estará presente antes do culto.",
    items: [
      "Pedido de disponibilidade",
      "Respostas dos voluntários",
      "Escala oficial por função",
      "Histórico de serviço",
    ],
  },
  {
    id: "financas",
    domain: "finances" as const,
    title: "Recebimentos e prestação de contas",
    description:
      "Receba dízimos e doações online, registre entradas e saídas manuais e exporte o histórico para assembleia.",
    items: [
      "Fundos de cobrança e página pública de doação",
      "Histórico, filtros e exportação CSV",
      "Livro-caixa com lançamentos manuais",
    ],
  },
  {
    id: "comunicacao",
    domain: "communication" as const,
    title: "Comunicados com histórico, não só no WhatsApp",
    description:
      "Publique para a igreja ou ministérios e mantenha o registro do que foi dito.",
    items: [
      "Comunicados no painel da igreja",
      "Segmentação por ministério",
      "Histórico de publicações",
      "Leitura pela equipe",
    ],
  },
];
