import type { Metadata } from "next";

import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verificar e-mail",
  description: "Confirme seu endereço de e-mail no Minha Church.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
