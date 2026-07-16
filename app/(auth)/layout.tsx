import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { PUBLIC_ROUTES } from "@/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-atmosphere relative flex min-h-dvh flex-col px-4 py-6 sm:px-6 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--attention)_12%,transparent),transparent_55%)]"
        aria-hidden
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-center sm:justify-start">
        <Logo />
      </header>

      <main className="relative flex flex-1 items-center justify-center py-8 sm:py-10">
        <div className="w-full max-w-6xl">{children}</div>
      </main>

      <footer className="relative mx-auto flex w-full max-w-6xl justify-center pb-2 sm:justify-start">
        <Link
          href={PUBLIC_ROUTES.home}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para o site
        </Link>
      </footer>
    </div>
  );
}
