import type { Metadata } from "next";

import { PricingSection } from "@/components/marketing/pricing-section";

export const metadata: Metadata = {
  title: "Preço",
  description:
    "Um plano, tudo incluído. Preço por faixa de membros — conheça os valores do Minha Church.",
};

export default function PrecoPage() {
  return <PricingSection />;
}
