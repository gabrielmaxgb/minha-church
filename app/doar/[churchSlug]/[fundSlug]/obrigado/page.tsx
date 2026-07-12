import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  AUTH_ROUTES,
  PUBLIC_ROUTES,
  givingFundPath,
} from "@/constants/routes";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ churchSlug: string; fundSlug: string }>;
  searchParams: Promise<{ redirect_status?: string }>;
};

export const metadata = createPageMetadata({
  title: "Contribuição recebida",
  description: "Obrigado pela sua contribuição.",
});

export default async function GivingThanksPage({
  params,
  searchParams,
}: PageProps) {
  const { churchSlug, fundSlug } = await params;
  const { redirect_status: redirectStatus } = await searchParams;
  const failed =
    redirectStatus === "failed" || redirectStatus === "requires_payment_method";

  return (
    <div className="relative mx-auto flex min-h-svh w-full max-w-lg items-center px-4 py-16 sm:px-6">
      <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="bg-[var(--giving-ink)] px-7 py-10 text-[var(--giving-paper)] sm:px-9 sm:py-12">
          <p className="text-xs font-medium tracking-wide text-[var(--giving-paper)]/50 uppercase">
            {failed ? "Pagamento" : "Contribuição"}
          </p>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {failed ? "Não concluído" : "Recebida"}
          </h1>
          <div className="mt-6 h-px w-12 bg-[var(--giving-trust)]" />
          <p className="mt-6 text-sm leading-relaxed text-[var(--giving-paper)]/70">
            {failed
              ? "Nada foi cobrado. Você pode voltar e tentar novamente."
              : "Obrigado. Sua contribuição foi registrada na conta da igreja. Se informou e-mail, o comprovante chega por lá."}
          </p>
        </div>
        <div className="flex flex-col gap-3 px-7 py-6 sm:px-9">
          {failed ? (
            <Button asChild className="w-full">
              <Link href={givingFundPath(churchSlug, fundSlug)}>
                Tentar novamente
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link href={AUTH_ROUTES.financesContributions}>
                  Ver contribuições
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={givingFundPath(churchSlug, fundSlug)}>
                  Nova contribuição
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="ghost" className="w-full">
            <Link href={PUBLIC_ROUTES.home}>Voltar ao site</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
