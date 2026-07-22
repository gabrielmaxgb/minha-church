"use client";

import Link from "next/link";

import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { PwaInstallGuide } from "@/components/pwa/pwa-install-guide";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";

export function InstallAppPublicContent() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Minha Church"
        title="Instalar app"
        support="Atalho no celular ou no computador — sem App Store e sem loja."
      />

      <MarketingSection noBorder>
        <div className="mx-auto max-w-md">
          <PwaInstallGuide />
          <div className="mt-8 flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={PUBLIC_ROUTES.login}>Entrar no painel</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={PUBLIC_ROUTES.home}>Voltar ao início</Link>
            </Button>
          </div>
        </div>
      </MarketingSection>
    </>
  );
}
