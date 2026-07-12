"use client";

import Link from "next/link";
import { ArrowRight, Landmark, Loader2 } from "lucide-react";

import { RequirePermission } from "@/components/auth/require-permission";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { GivingDonationsPanel } from "@/components/dashboard/finances/giving-donations-panel";
import { GivingFundsPanel } from "@/components/dashboard/finances/giving-funds-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { settingsSectionPath } from "@/constants/routes";
import { useConnectStatus } from "@/lib/api/queries";
import type { ConnectOnboardingStatus } from "@/lib/api/payments";
import { useAuth } from "@/providers/auth-provider";

function ownerActivationCopy(status: ConnectOnboardingStatus): {
  title: string;
  description: string;
  cta: string;
} {
  switch (status) {
    case "onboarding":
    case "created":
      return {
        title: "Conclua a ativação dos recebimentos",
        description:
          "O cadastro da sua conta de recebimentos foi iniciado, mas ainda não foi concluído. Retome para começar a receber dízimos, doações e inscrições em eventos.",
        cta: "Continuar configuração",
      };
    case "verifying":
      return {
        title: "Recebimentos em verificação",
        description:
          "O Stripe está analisando os dados enviados. Assim que a conta for aprovada, você poderá receber pagamentos por aqui.",
        cta: "Ver situação",
      };
    case "restricted":
      return {
        title: "Recebimentos com pendências",
        description:
          "O Stripe precisa de mais informações para liberar os recebimentos. Resolva as pendências para ativar a conta.",
        cta: "Resolver pendências",
      };
    case "rejected":
      return {
        title: "Conta de recebimentos recusada",
        description:
          "Não foi possível aprovar a conta de recebimentos. Veja os detalhes e fale com o suporte.",
        cta: "Ver detalhes",
      };
    default:
      return {
        title: "Ative os recebimentos da sua igreja",
        description:
          "Receba dízimos, doações e inscrições em eventos por Pix, cartão e boleto, com relatórios centralizados no Minha Church.",
        cta: "Ativar recebimentos",
      };
  }
}

function FinancesActivation() {
  const { user } = useAuth();
  const { data, isPending } = useConnectStatus();

  if (!user?.isOwner) {
    return (
      <div className="space-y-10">
        <GivingDonationsPanel />
        <GivingFundsPanel />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando situação dos recebimentos...
      </div>
    );
  }

  if (data?.canReceivePayments) {
    return (
      <div className="space-y-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Conta ativa</Badge>
          <p className="text-sm text-muted-foreground">
            Sua igreja já pode receber. Crie fundos e compartilhe o link de
            contribuição.
          </p>
        </div>
        <GivingDonationsPanel />
        <GivingFundsPanel />
      </div>
    );
  }

  const copy = ownerActivationCopy(data?.onboardingStatus ?? "none");

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
        <Landmark className="size-5" aria-hidden />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">
        {copy.title}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        {copy.description}
      </p>
      <div className="mt-6">
        <Button asChild className="gap-2">
          <Link href={settingsSectionPath("recebimentos")}>
            {copy.cta}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function FinancasPage() {
  return (
    <RequirePermission permission="finances">
      <DashboardPage
        title="Finanças"
        subtitle="Entradas, saídas e prestação de contas"
      >
        <FinancesActivation />
      </DashboardPage>
    </RequirePermission>
  );
}
