import type { Pricing } from "@/types";

import { marketingPricingBenefits } from "@/constants/marketing-pitch";
import { apiClient } from "@/lib/api/client";

const sharedBenefits = [...marketingPricingBenefits];

// Fallback offline — espelha GET /pricing (fonte: billing-plans.config.ts no backend).
export const pricing: Pricing = {
  name: "Minha Church",
  description:
    "As mesmas funcionalidades em todas as faixas. O valor é definido pelo número de membros, não por pacotes de recursos.",
  benefits: sharedBenefits,
  valueAnchor: {
    headline:
      "Um custo inferior a um turno de secretaria — com menos dependência de planilhas, formulários soltos e grupos de WhatsApp.",
    example:
      "Em uma igreja com cerca de 200 membros, o valor mensal fica em torno de R$ 1,45 por membro.",
  },
  cta: "Começar grátis",
  tiers: [
    {
      id: "ate-100",
      name: "Pequena Igreja",
      memberRange: "Até 100 membros",
      memberCountForPricePerMember: 100,
      monthlyPrice: 119,
      yearlyPrice: 1190,
    },
    {
      id: "101-300",
      name: "Igreja em Crescimento",
      memberRange: "101 a 300 membros",
      memberCountForPricePerMember: 200,
      monthlyPrice: 289,
      yearlyPrice: 2890,
      highlighted: true,
    },
    {
      id: "301-700",
      name: "Igreja Consolidada",
      memberRange: "301 a 700 membros",
      memberCountForPricePerMember: 500,
      monthlyPrice: 489,
      yearlyPrice: 4890,
    },
    {
      id: "701-plus",
      name: "Multi-Congregação",
      memberRange: "701 membros ou mais",
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
