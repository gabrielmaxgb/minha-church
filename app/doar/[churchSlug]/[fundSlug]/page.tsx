import { notFound } from "next/navigation";

import { GivingCheckoutForm } from "@/components/giving/giving-checkout-form";
import { FormAlert } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api/client";
import { fetchPublicGivingFund } from "@/lib/api/payments";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ churchSlug: string; fundSlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { churchSlug, fundSlug } = await params;

  try {
    const fund = await fetchPublicGivingFund(churchSlug, fundSlug);
    return createPageMetadata({
      title: `${fund.fundName} · ${fund.churchName}`,
      description:
        fund.fundDescription ??
        `Contribua com ${fund.fundName} em ${fund.churchName}.`,
    });
  } catch {
    return createPageMetadata({
      title: "Contribuir",
      description: "Página de contribuição da igreja.",
    });
  }
}

export default async function GivingCheckoutPage({ params }: PageProps) {
  const { churchSlug, fundSlug } = await params;

  let fund;
  try {
    fund = await fetchPublicGivingFund(churchSlug, fundSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Não foi possível carregar esta página de contribuição.";

    return (
      <div className="mx-auto flex min-h-svh w-full max-w-lg items-center px-4 py-16">
        <FormAlert>{message}</FormAlert>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-svh w-full items-center px-4 py-10 sm:px-6 sm:py-14">
      <GivingCheckoutForm fund={fund} />
    </div>
  );
}
