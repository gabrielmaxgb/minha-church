import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
  description: "Defina uma nova senha para sua conta no Minha Church.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
