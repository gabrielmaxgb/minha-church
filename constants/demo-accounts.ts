export const DEMO_PASSWORD = "senha123";

export interface DemoAccount {
  email: string;
  label: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "owner@igreja.com.br", label: "Proprietário" },
  { email: "admin@igreja.com.br", label: "Administrador" },
  { email: "pastor@igreja.com.br", label: "Pastor" },
  { email: "secretary@igreja.com.br", label: "Secretário" },
  { email: "treasurer@igreja.com.br", label: "Tesoureiro" },
  { email: "leader@igreja.com.br", label: "Líder" },
  { email: "member@igreja.com.br", label: "Membro" },
];

export const SHOW_DEMO_ACCOUNTS =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true";
