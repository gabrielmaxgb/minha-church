import type { Metadata } from "next";

import { InstallAppPublicContent } from "@/components/pwa/install-app-public-content";

export const metadata: Metadata = {
  title: "Instalar app",
  description:
    "Instale o Minha Church no celular ou no computador — atalho rápido, sem App Store.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function InstalarAppPublicPage() {
  return <InstallAppPublicContent />;
}
