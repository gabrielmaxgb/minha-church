import type { Metadata } from "next";

import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verificar e-mail",
  description:
    "Confirme seu e-mail e seja bem-vindo ao MinhaChurch — sua igreja organizada a partir de hoje.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
