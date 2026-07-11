import type { Metadata } from "next";

import { AuthPausedNotice } from "@/components/auth/auth-paused-notice";
import { LoginForm } from "@/components/auth/login-form";
import { AUTH_ACCESS_ENABLED } from "@/constants/auth-access";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre para ver a semana da sua igreja no Minha Church.",
};

export default function LoginPage() {
  if (!AUTH_ACCESS_ENABLED) {
    return <AuthPausedNotice />;
  }

  return <LoginForm />;
}
