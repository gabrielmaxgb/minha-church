import type { Pricing } from "@/types";

import { apiClient } from "@/lib/api/client";

const sharedBenefits = [
	"Membros, ministérios e escalas no mesmo lugar — sem planilha paralela",
	"Comunicados oficiais da liderança, sem virar grupo de WhatsApp",
	"Agenda de cultos e eventos com coleta de disponibilidade da equipe",
	"Permissões por cargo: cada líder vê e faz só o que precisa",
	"Histórico pastoral e cadastro centralizado, acessível com segurança",
	"Importação de membros por planilha em poucos minutos",
];

// Fallback offline — espelha GET /pricing (fonte: billing-plans.config.ts no backend).
export const pricing: Pricing = {
	name: "Minha Church",
	description:
		"Mesmas funcionalidades em todas as faixas. Você paga conforme o tamanho da sua igreja — não por pacote de recursos.",
	benefits: sharedBenefits,
	valueAnchor: {
		headline:
			"Menos do que um turno de secretaria — e muito menos caos com planilhas, formulários soltos e grupos de WhatsApp.",
		example:
			"Para uma igreja com cerca de 200 membros cadastrados, o investimento fica em torno de R$ 1,45 por membro por mês no plano mensal.",
	},
	cta: "Começar grátis",
	tiers: [
		{
			id: "ate-100",
			name: "Pequena Igreja",
			memberRange: "Até 100 membros cadastrados",
			memberCountForPricePerMember: 100,
			monthlyPrice: 119,
			yearlyPrice: 1190,
		},
		{
			id: "101-300",
			name: "Igreja em Crescimento",
			memberRange: "101 a 300 membros cadastrados",
			memberCountForPricePerMember: 200,
			monthlyPrice: 289,
			yearlyPrice: 2890,
			highlighted: true,
		},
		{
			id: "301-700",
			name: "Igreja Consolidada",
			memberRange: "301 a 700 membros cadastrados",
			memberCountForPricePerMember: 500,
			monthlyPrice: 489,
			yearlyPrice: 4890,
		},
		{
			id: "701-plus",
			name: "Multi-Congregação",
			memberRange: "701 membros cadastrados ou mais",
			memberCountForPricePerMember: 1000,
			monthlyPrice: 589,
			yearlyPrice: 5890,
		},
	],
};

export async function fetchPricing(): Promise<Pricing> {
  try {
    return await apiClient<Pricing>("/pricing", { skipAuth: true });
  } catch {
    return pricing;
  }
}
