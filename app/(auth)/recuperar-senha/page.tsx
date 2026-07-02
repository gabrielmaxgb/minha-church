import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Recupere o acesso à sua conta no Minha Church.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
