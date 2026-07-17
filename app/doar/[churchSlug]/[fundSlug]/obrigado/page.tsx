import { GivingThanksPanel } from "@/components/giving/giving-thanks-panel";
import {
  AUTH_ROUTES,
  PUBLIC_ROUTES,
  givingFundPath,
} from "@/constants/routes";
import { createPageMetadata } from "@/lib/metadata";

import "@/app/doar/giving.css";

type PageProps = {
  params: Promise<{ churchSlug: string; fundSlug: string }>;
  searchParams: Promise<{ donationId?: string; rt?: string }>;
};

export const metadata = createPageMetadata({
  title: "Contribuição",
  description: "Status da sua contribuição.",
});

export default async function GivingThanksPage({
  params,
  searchParams,
}: PageProps) {
  const { churchSlug, fundSlug } = await params;
  const { donationId, rt } = await searchParams;
  const fundHref = givingFundPath(churchSlug, fundSlug);

  return (
    <div className="giving-root relative mx-auto flex min-h-svh w-full max-w-lg items-center px-4 py-16 sm:px-6">
      <GivingThanksPanel
        donationId={donationId}
        receiptToken={rt}
        className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
        backHref={PUBLIC_ROUTES.home}
        backLabel="Voltar ao site"
        retryHref={fundHref}
        retryLabel="Tentar novamente"
        primaryHref={AUTH_ROUTES.financesContributions}
        primaryLabel="Ver contribuições"
        secondaryHref={fundHref}
        secondaryLabel="Nova contribuição"
      />
    </div>
  );
}
