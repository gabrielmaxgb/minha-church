import type { Metadata } from "next";

import { FaqContent } from "@/components/marketing/faq-content";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description:
    "Tire suas dúvidas sobre o Minha Church — preço, segurança, importação de membros e período gratuito.",
};

export default function FaqPage() {
  return <FaqContent />;
}
