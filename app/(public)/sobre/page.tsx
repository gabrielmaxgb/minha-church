import type { Metadata } from "next";

import { AboutContent } from "@/components/marketing/about-content";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a história, missão e equipe por trás do Minha Church — plataforma de gestão feita para igrejas brasileiras.",
};

export default function SobrePage() {
  return <AboutContent />;
}
