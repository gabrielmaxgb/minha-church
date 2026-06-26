import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>

      {children}

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para o site
      </Link>
    </div>
  );
}
