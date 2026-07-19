import type { Metadata } from "next";

import { AuthPausedNotice } from "@/components/auth/auth-paused-notice";
import { RegisterChurchForm } from "@/components/auth/register-church-form";
import { AUTH_ACCESS_ENABLED } from "@/constants/auth-access";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Monte o espaço da sua igreja em minutos. 30 dias grátis, sem cartão — membros, escalas e comunicados liberados.",
};

export default function RegisterChurchPage() {
  if (!AUTH_ACCESS_ENABLED) {
    return <AuthPausedNotice />;
  }

  return <RegisterChurchForm />;
}
