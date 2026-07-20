"use client";

import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Magnetic } from "@/components/motion/magnetic";
import { MarketingPageHero } from "@/components/motion/marketing-page-hero";
import { MobileOnlyGate } from "@/components/pwa/mobile-only-gate";
import { PwaInstallGuide } from "@/components/pwa/pwa-install-guide";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";

export function InstallAppPublicContent() {
  return (
    <MobileOnlyGate
      desktopHref={PUBLIC_ROUTES.home}
      fallback={
        <Container className="py-16">
          <p className="text-sm text-muted-foreground">Carregando…</p>
        </Container>
      }
    >
      <MarketingPageHero
        eyebrow="Minha Church"
        title="Instalar app"
        support="Guia rápido para o celular. No computador, use o navegador normalmente."
        display={false}
      />

      <section>
        <Container className="py-8 sm:py-10">
          <div className="mx-auto max-w-md">
            <PwaInstallGuide />
            <div className="mt-8 flex flex-col gap-2">
              <Magnetic className="w-full">
                <Button asChild className="w-full">
                  <Link href={PUBLIC_ROUTES.login}>Entrar no painel</Link>
                </Button>
              </Magnetic>
              <Button asChild variant="outline" className="w-full">
                <Link href={PUBLIC_ROUTES.home}>Voltar ao início</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </MobileOnlyGate>
  );
}
