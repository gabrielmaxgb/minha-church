import { GivingSubscriptionManagePanel } from "@/components/giving/giving-subscription-manage-panel";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ subscriptionId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export const metadata = createPageMetadata({
  title: "Gerenciar contribuição mensal",
  description: "Cancele ou fale com a igreja sobre sua contribuição mensal.",
});

export default async function GivingSubscriptionManagePage({
  params,
  searchParams,
}: PageProps) {
  const { subscriptionId } = await params;
  const { token } = await searchParams;

  return (
    <div className="relative mx-auto flex min-h-svh w-full max-w-lg items-start px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full">
        <GivingSubscriptionManagePanel
          subscriptionId={subscriptionId}
          token={token ?? ""}
        />
      </div>
    </div>
  );
}
