import type { Metadata } from "next";

import { EmailSentForm } from "@/components/auth/email-sent-form";

export const metadata: Metadata = {
  title: "E-mail enviado",
  description:
    "Enviamos um link de confirmação. Confirme seu e-mail e seja bem-vindo ao MinhaChurch.",
};

export default function EmailSentPage() {
  return <EmailSentForm />;
}
