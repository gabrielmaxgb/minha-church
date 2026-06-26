import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse o painel da sua igreja no Minha Church.",
};

export default function LoginPage() {
  return <LoginForm />;
}
