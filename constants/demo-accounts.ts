import type { UserRole } from "@/types/auth";

export const DEMO_PASSWORD = "senha123";

export interface DemoAccount {
  email: string;
  role: UserRole;
  label: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "owner@igreja.com.br", role: "owner", label: "Proprietário" },
  { email: "admin@igreja.com.br", role: "admin", label: "Administrador" },
  { email: "pastor@igreja.com.br", role: "pastor", label: "Pastor" },
  { email: "secretary@igreja.com.br", role: "secretary", label: "Secretário" },
  { email: "treasurer@igreja.com.br", role: "treasurer", label: "Tesoureiro" },
  { email: "leader@igreja.com.br", role: "leader", label: "Líder" },
  { email: "member@igreja.com.br", role: "member", label: "Membro" },
];

export const SHOW_DEMO_ACCOUNTS =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true";
