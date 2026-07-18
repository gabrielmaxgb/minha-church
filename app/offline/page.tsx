import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Offline",
    description: "Sem conexão — o Minha Church volta assim que a rede retornar.",
  }),
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground">
          <WifiOff className="size-6" aria-hidden />
        </div>
        <p className="font-display mt-6 text-2xl font-bold tracking-tight text-foreground">
          Minha Church
        </p>
        <h1 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
          Sem conexão no momento
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          O casco do app está aqui, mas os dados da igreja precisam de internet.
          Assim que a rede voltar, continue de onde parou.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={AUTH_ROUTES.dashboard}>Tentar de novo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={PUBLIC_ROUTES.home}>Ir ao site</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
