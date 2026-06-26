import type { Metadata } from "next";

import { PricingSection } from "@/components/marketing/pricing-section";

export const metadata: Metadata = {
  title: "Planos",
  description:
    "Escolha o plano ideal para sua igreja. Planos flexíveis para comunidades de todos os tamanhos.",
};

export default function PlanosPage() {
  return <PricingSection />;
}
