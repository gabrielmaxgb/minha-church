import type { Metadata } from "next";

import { RecursosContent } from "@/components/marketing/recursos-content";

export const metadata: Metadata = {
  title: "Recursos",
  description:
    "Conheça todos os recursos do Minha Church — gestão de membros, cultos, escalas, finanças, comunicação e relatórios.",
};

export default function RecursosPage() {
  return <RecursosContent />;
}
