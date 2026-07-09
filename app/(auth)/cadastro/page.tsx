import type { Metadata } from "next";

import { RegisterChurchForm } from "@/components/auth/register-church-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Cadastre sua igreja no Minha Church em poucos passos e comece grátis.",
};

export default function RegisterChurchPage() {
  return <RegisterChurchForm />;
}
