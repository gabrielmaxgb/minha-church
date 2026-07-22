import type { Metadata } from "next";

import { RecursosContent } from "@/components/marketing/recursos-content";
import { marketingPitch } from "@/constants/marketing-pitch";

export const metadata: Metadata = {
  title: "Recursos",
  description: marketingPitch.recursosHero,
};

export default function RecursosPage() {
  return <RecursosContent />;
}
