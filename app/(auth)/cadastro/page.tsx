import type { Metadata } from "next";

import { RegisterChurchForm } from "@/components/auth/register-church-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Monte o espaço da sua igreja em minutos. 30 dias grátis, sem cartão — membros, escalas e avisos liberados.",
};

export default function RegisterChurchPage() {
  return <RegisterChurchForm />;
}
