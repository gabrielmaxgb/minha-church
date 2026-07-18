"use client";

import Link from "next/link";

import { Container } from "@/components/layout/container";
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
      <section className="border-b border-border">
        <Container className="py-10 sm:py-12">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Minha Church
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Instalar app
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Guia rápido para o celular. No computador, use o navegador
            normalmente.
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-8 sm:py-10">
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
        </Container>
      </section>
    </MobileOnlyGate>
  );
}
