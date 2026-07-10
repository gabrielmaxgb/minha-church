import type { Metadata } from "next";

import { RegisterChurchForm } from "@/components/auth/register-church-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Cadastre sua igreja em minutos. 30 dias grátis, sem cartão — pague só pela faixa do tamanho da sua comunidade.",
};

export default function RegisterChurchPage() {
  return <RegisterChurchForm />;
}
