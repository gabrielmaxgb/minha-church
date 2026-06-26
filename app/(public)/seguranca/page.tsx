import type { Metadata } from "next";

import { SegurancaContent } from "@/components/marketing/seguranca-content";

export const metadata: Metadata = {
  title: "Segurança",
  description:
    "Saiba como o Minha Church protege os dados da sua igreja — criptografia, backup, LGPD e controle de acesso.",
};

export default function SegurancaPage() {
  return <SegurancaContent />;
}
