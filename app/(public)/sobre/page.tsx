import type { Metadata } from "next";

import { AboutContent } from "@/components/marketing/about-content";
import { marketingPitch } from "@/constants/marketing-pitch";

export const metadata: Metadata = {
  title: "Sobre",
  description: marketingPitch.siteDescription,
};

export default function SobrePage() {
  return <AboutContent />;
}
