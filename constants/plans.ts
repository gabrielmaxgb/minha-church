import type { Plan } from "@/types";

export const plans: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    description: "Para igrejas pequenas que estão começando.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Até 50 membros",
      "Gestão básica de eventos",
      "Comunicação por e-mail",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para igrejas em crescimento que precisam de mais recursos.",
    monthlyPrice: 97,
    yearlyPrice: 970,
    features: [
      "Até 500 membros",
      "Eventos e cultos ilimitados",
      "Gestão financeira completa",
      "Relatórios e dashboards",
      "Suporte prioritário",
    ],
    highlighted: true,
    cta: "Começar agora",
  },
  {
    id: "church",
    name: "Igreja",
    description: "Para grandes comunidades com necessidades avançadas.",
    monthlyPrice: 247,
    yearlyPrice: 2470,
    features: [
      "Membros ilimitados",
      "Multi-congregações",
      "Integrações avançadas",
      "API e webhooks",
      "Gerente de conta dedicado",
    ],
    cta: "Falar com vendas",
  },
];

export async function fetchPlans(): Promise<Plan[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return plans;
}
