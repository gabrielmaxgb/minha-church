import type { Metadata } from "next";

import { InstallAppPublicContent } from "@/components/pwa/install-app-public-content";

export const metadata: Metadata = {
  title: "Instalar app",
  description:
    "Adicione o Minha Church à tela inicial do celular — acesso rápido, sem App Store.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function InstalarAppPublicPage() {
  return <InstallAppPublicContent />;
}
