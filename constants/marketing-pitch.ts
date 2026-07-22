import type { ProductDomain } from "@/lib/ui/domain-theme";

/**
 * Pitch único do marketing público — resultado, não nome de tela.
 * Fonte para home, recursos, preços, SEO, CTA e auth.
 */

export const marketingPitch = {
  tagline: "A rotina da igreja em um só lugar.",
  /** Meta / OG / footer description */
  siteDescription:
    "Membros, escalas, comunicados, finanças e cuidado pastoral no mesmo painel — sem planilhas e grupos espalhados. Feito para pastores e líderes.",
  /** Hero / páginas: o que o produto cobre */
  productScope:
    "Membros, ministérios, escalas, comunicados, finanças e cuidado pastoral no mesmo painel.",
  recursosHero:
    "Do cadastro às escalas, do comunicado ao caixa e ao cuidado pastoral — a rotina que a liderança vive de verdade.",
  recursosIntro: "Cada fluxo do dia a dia da igreja, no mesmo lugar.",
  ctaTitle: "Pronto para organizar a rotina da sua igreja?",
  ctaDescription:
    "Membros, escalas, comunicados, finanças e cuidado pastoral. 30 dias gratuitos, sem cartão.",
  pricingHero:
    "Todas as faixas incluem o mesmo conjunto de recursos. O valor é definido pelo número de membros. 30 dias gratuitos, sem cartão.",
  pricingTableTitle: "Valores por faixa de membros",
  pricingTableSupport:
    "O produto é o mesmo em todas as faixas. O valor varia apenas com o número de membros.",
  pricingIncludedBannerTitle: "Recursos iguais em todas as faixas",
  pricingIncludedBannerSupport:
    "Membros, escalas, comunicados, finanças e cuidado pastoral estão disponíveis em qualquer plano. A faixa muda só conforme quantos membros a igreja tem.",
  pricingFaqSupport: "Período de teste, número de membros e ciclo de pagamento.",
  pricingCtaTitle: "Comece com 30 dias gratuitos",
  pricingIncluded:
    "Sim. Todas as faixas incluem os mesmos recursos: membros, ministérios, escalas, comunicados, finanças, cuidado pastoral e relatórios. A diferença é apenas o número de membros.",
  loginSupport:
    "Entre para ver a semana, as escalas, o caixa e o que ainda precisa da sua atenção.",
} as const;

export type MarketingScreenCard = {
  title: string;
  description: string;
  domain: ProductDomain;
};

/** Cards da home — o que a liderança resolve. */
export const marketingScreens: MarketingScreenCard[] = [
  {
    title: "A semana",
    description: "O culto que vem e o que ainda está pendente.",
    domain: "home",
  },
  {
    title: "Escalas",
    description:
      "Você convida, vê quem confirmou e fecha a equipe antes do culto.",
    domain: "schedules",
  },
  {
    title: "Famílias",
    description: "Pais, cônjuges e filhos juntos no cadastro.",
    domain: "members",
  },
  {
    title: "Comunicados",
    description:
      "Publica pra igreja ou pra um ministério. O que saiu fica registrado.",
    domain: "communication",
  },
  {
    title: "Finanças",
    description: "Oferta online, lançamento no caixa e fechamento do mês.",
    domain: "finances",
  },
  {
    title: "Cuidado",
    description:
      "Pedidos de oração, aconselhamento e quem a liderança precisa acompanhar.",
    domain: "members",
  },
  {
    title: "Ministérios",
    description: "Área, cargo e permissão. Cada líder no que é da função.",
    domain: "schedules",
  },
  {
    title: "Eventos",
    description: "Culto e encontro com data, local e se repete.",
    domain: "activities",
  },
  {
    title: "Relatórios",
    description: "Números pra assembleia sem montar planilha na véspera.",
    domain: "reports",
  },
];

export const marketingPricingBenefits = [
  "Membros, ministérios e escalas em um único ambiente",
  "Comunicados oficiais com histórico, fora do WhatsApp",
  "Dízimos e ofertas online, caixa e relatório mensal",
  "Pedidos de oração, aconselhamento e acompanhamento pastoral",
  "Agenda de cultos e eventos com coleta de disponibilidade",
  "Permissões por cargo, alinhadas à função de cada líder",
  "Importação de membros por planilha",
] as const;

export const marketingAuthHighlights = [
  {
    title: "Membros no lugar certo",
    description: "Cadastro e famílias sem planilha perdida.",
  },
  {
    title: "Escalas com antecedência",
    description: "Convide, confirme e feche a equipe do culto.",
  },
  {
    title: "Comunicados com histórico",
    description: "Avise a igreja sem depender só do WhatsApp.",
  },
  {
    title: "Caixa sob controle",
    description: "Ofertas online e fechamento do mês no mesmo painel.",
  },
] as const;
