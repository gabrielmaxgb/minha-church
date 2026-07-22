import type { Metadata } from "next";

import { PricingSection } from "@/components/marketing/pricing-section";
import { marketingPitch } from "@/constants/marketing-pitch";

export const metadata: Metadata = {
  title: "Preço",
  description: marketingPitch.pricingHero,
};

export default function PrecoPage() {
  return <PricingSection />;
}
