import type { Metadata } from "next";

import {
  BenefitsSection,
  ChaosToCalmSection,
  CtaSection,
  FamilyGraphDemoSection,
  FlowsSection,
  HeroSection,
  HomeFaqSection,
  HowItWorksSection,
  ScreensSection,
} from "@/components/marketing/home-sections";
import { siteConfig } from "@/constants/navigation";

export const metadata: Metadata = {
  title: "A rotina da igreja, em um só lugar",
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ChaosToCalmSection />
      <FamilyGraphDemoSection />
      <FlowsSection />
      <ScreensSection />
      <HowItWorksSection />
      <BenefitsSection />
      <HomeFaqSection />
      <CtaSection />
    </>
  );
}
