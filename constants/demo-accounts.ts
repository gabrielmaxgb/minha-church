export const DEMO_PASSWORD = "senha123";

export interface DemoAccount {
  email: string;
  label: string;
}

/** Perfis de sistema na Igreja Batista Central */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "owner@igreja.com.br", label: "Proprietário" },
  { email: "admin@igreja.com.br", label: "Administrador" },
  { email: "pastor@igreja.com.br", label: "Pastor" },
  { email: "secretary@igreja.com.br", label: "Secretário" },
  { email: "treasurer@igreja.com.br", label: "Tesoureiro" },
  { email: "leader@igreja.com.br", label: "Líder" },
  { email: "member@igreja.com.br", label: "Membro" },
];

/** Igrejas por faixa Stripe — seed `npm run db:seed:billing-tiers` */
export const DEMO_BILLING_TIER_ACCOUNTS: DemoAccount[] = [
  {
    email: "owner-tier-small@billing.test",
    label: "Tier Small — 50 membros",
  },
  {
    email: "owner-tier-growth@billing.test",
    label: "Tier Growth — 200 membros",
  },
  {
    email: "owner-tier-consolidated@billing.test",
    label: "Tier Consolidated — 500 membros",
  },
  {
    email: "owner-tier-multi@billing.test",
    label: "Tier Multi — 800 membros",
  },
  {
    email: "owner-tier-crossing@billing.test",
    label: "Tier Crossing — 99 membros (teste P2)",
  },
];

/** Membros mock — Igreja Batista Central (senha: senha123) */
export const DEMO_MOCK_MEMBERS: DemoAccount[] = [
  { email: "ana.mendes@batistacentral.demo", label: "Ana Carolina Mendes" },
  { email: "bruno.silva@batistacentral.demo", label: "Bruno Henrique Silva" },
  { email: "camila.fernandes@batistacentral.demo", label: "Camila Fernandes" },
  { email: "daniel.oliveira@batistacentral.demo", label: "Daniel Oliveira" },
  { email: "eduarda.costa@batistacentral.demo", label: "Eduarda Costa" },
  { email: "felipe.rodrigues@batistacentral.demo", label: "Felipe Rodrigues" },
  { email: "gabriela.almeida@batistacentral.demo", label: "Gabriela Almeida" },
  { email: "henrique.barbosa@batistacentral.demo", label: "Henrique Barbosa" },
  { email: "isabela.martins@batistacentral.demo", label: "Isabela Martins" },
  { email: "joao.lima@batistacentral.demo", label: "João Pedro Lima" },
  { email: "karina.souza@batistacentral.demo", label: "Karina Souza" },
  { email: "lucas.pereira@batistacentral.demo", label: "Lucas Pereira" },
  { email: "mariana.ribeiro@batistacentral.demo", label: "Mariana Ribeiro" },
  { email: "nicolas.gomes@batistacentral.demo", label: "Nicolas Gomes" },
  { email: "olivia.carvalho@batistacentral.demo", label: "Olívia Carvalho" },
  { email: "paulo.nunes@batistacentral.demo", label: "Paulo César Nunes" },
  { email: "rafaela.dias@batistacentral.demo", label: "Rafaela Dias" },
  { email: "samuel.teixeira@batistacentral.demo", label: "Samuel Teixeira" },
  { email: "tatiane.freitas@batistacentral.demo", label: "Tatiane Freitas" },
  { email: "vinicius.araujo@batistacentral.demo", label: "Vinícius Araújo" },
];

const isVercelProduction =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export const SHOW_DEMO_ACCOUNTS =
  !isVercelProduction &&
  (process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true");
