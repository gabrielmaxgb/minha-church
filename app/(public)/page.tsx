import type { Metadata } from "next";

import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  SocialProofSection,
} from "@/components/marketing/home-sections";
import { siteConfig } from "@/constants/navigation";

export const metadata: Metadata = {
  title: "Gestão de igreja em um único sistema",
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <SocialProofSection />
      <CtaSection />
    </>
  );
}
