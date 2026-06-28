import type { Pricing } from "@/types";

const sharedBenefits = [
	"Saiba quem está afastado e cuide no tempo certo",
	"Organize escalas sem depender de mensagens no WhatsApp",
	"Centralize membros, finanças e comunicação em um só lugar",
	"Tenha histórico pastoral acessível para toda a liderança",
	"Acompanhe cultos, eventos e voluntários com clareza",
	"Gere relatórios e prestação de contas sem planilhas",
	"Importe sua base de membros em minutos",
];

// Mock — substituir por resposta da API quando o backend estiver pronto
export const pricing: Pricing = {
	name: "Minha Church",
	description:
		"Mesmas funcionalidades em todas as faixas — você paga de acordo com o tamanho da sua igreja.",
	benefits: sharedBenefits,
	valueAnchor: {
		headline:
			"Menos do que o custo de um almoço por semana para manter toda a administração da sua igreja organizada.",
		example:
			"Para uma igreja de 200 membros, o custo é cerca de R$ 1 por membro por mês.",
	},
	cta: "Começar grátis",
	tiers: [
		{
			id: "ate-100",
			name: "Pequena Igreja",
			memberRange: "Até 100 membros",
			memberCountForPricePerMember: 100,
			monthlyPrice: 99.9,
			yearlyPrice: 999,
		},
		{
			id: "101-300",
			name: "Igreja em Crescimento",
			memberRange: "101–300 membros",
			memberCountForPricePerMember: 300,
			monthlyPrice: 199.9,
			yearlyPrice: 1999,
		},
		{
			id: "301-700",
			name: "Igreja Consolidada",
			memberRange: "301–700 membros",
			memberCountForPricePerMember: 700,
			monthlyPrice: 299.9,
			yearlyPrice: 2999,
		},
		{
			id: "701-plus",
			name: "Multi-Congregação",
			memberRange: "701+ membros",
			memberCountForPricePerMember: 701,
			monthlyPrice: 399.9,
			yearlyPrice: 3999,
		},
	],
};

export async function fetchPricing(): Promise<Pricing> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return pricing;
}
