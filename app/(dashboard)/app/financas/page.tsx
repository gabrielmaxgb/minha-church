"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  Landmark,
  Loader2,
  Lock,
  NotebookPen,
  PiggyBank,
  Receipt,
  RefreshCw,
} from "lucide-react";

import { RequirePermission } from "@/components/auth/require-permission";
import { StripeWordmark, stripeOutlineButtonClassName } from "@/components/brand/stripe-mark";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { ConnectPayoutsPanel } from "@/components/dashboard/finances/connect-payouts-panel";
import { FinanceEntriesPanel } from "@/components/dashboard/finances/finance-entries-panel";
import { FinancesSummaryCards } from "@/components/dashboard/finances/finances-summary-cards";
import { GivingDonationsPanel } from "@/components/dashboard/finances/giving-donations-panel";
import { GivingFundsPanel } from "@/components/dashboard/finances/giving-funds-panel";
import { GivingSubscriptionsPanel } from "@/components/dashboard/finances/giving-subscriptions-panel";
import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { AUTH_ROUTES, settingsSectionPath } from "@/constants/routes";
import {
  resolvePaymentsError,
  useConnectStatus,
  useOpenExpressDashboard,
  usePaymentsSummary,
} from "@/lib/api/queries";
import type { ConnectOnboardingStatus } from "@/lib/api/payments";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type FinancesTab =
  | "fundos"
  | "contribuicoes"
  | "mensais"
  | "repasses"
  | "caixa";

function parseFinancesHash(hash: string): FinancesTab {
  if (hash === "#contribuicoes") {
    return "contribuicoes";
  }
  if (hash === "#mensais") {
    return "mensais";
  }
  if (hash === "#repasses") {
    return "repasses";
  }
  if (
    hash === "#movimentacoes" ||
    hash === "#lancamentos-manuais" ||
    hash === "#caixa"
  ) {
    return "caixa";
  }
  return "fundos";
}

function financesHashForTab(tab: FinancesTab): string {
  switch (tab) {
    case "contribuicoes":
      return "#contribuicoes";
    case "mensais":
      return "#mensais";
    case "repasses":
      return "#repasses";
    case "caixa":
      return "#caixa";
    default:
      return "";
  }
}

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
          "O cadastro da sua conta de recebimentos foi iniciado, mas ainda não foi concluído. Retome para começar a receber dízimos e doações.",
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
          "Três passos: complete o perfil, conecte a conta bancária e comece a receber contribuições por Pix, cartão e boleto.",
        cta: "Começar ativação",
      };
  }
}

function FinancesLockedCard({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
        <Lock className="size-5" aria-hidden />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">
        Recebimentos indisponíveis
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        {isOwner
          ? "Os recebimentos fazem parte do plano. Reative sua assinatura para voltar a coletar dízimos e doações."
          : "Os recebimentos estão indisponíveis no momento. Fale com a liderança da igreja para reativar o plano."}
      </p>
      {isOwner && (
        <div className="mt-6">
          <SubscribePricingTrigger className="gap-2">
            Reativar assinatura
          </SubscribePricingTrigger>
        </div>
      )}
    </div>
  );
}

function FinancesManageTabs({
  value,
  onChange,
}: {
  value: FinancesTab;
  onChange: (tab: FinancesTab) => void;
}) {
  const tabs: Array<{
    id: FinancesTab;
    label: string;
    shortLabel: string;
    icon: typeof PiggyBank;
  }> = [
    { id: "fundos", label: "Fundos", shortLabel: "Fundos", icon: PiggyBank },
    {
      id: "contribuicoes",
      label: "Entradas",
      shortLabel: "Entradas",
      icon: Receipt,
    },
    {
      id: "mensais",
      label: "Recorrentes",
      shortLabel: "Mensais",
      icon: RefreshCw,
    },
    {
      id: "repasses",
      label: "Repasses",
      shortLabel: "Repasses",
      icon: Building2,
    },
    {
      id: "caixa",
      label: "Lançamentos manuais",
      shortLabel: "Caixa",
      icon: NotebookPen,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Gestão financeira"
      className="-mx-1 flex w-full gap-1 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:inline-flex sm:w-auto sm:flex-wrap sm:overflow-visible sm:rounded-xl sm:border sm:border-border sm:bg-muted/35 sm:p-1 sm:pb-1"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`financas-tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors sm:flex-1 sm:min-w-28 sm:flex-none",
              selected
                ? "bg-foreground/85 font-medium text-background"
                : "border border-border bg-card font-normal text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:border-transparent sm:bg-transparent",
            )}
          >
            <Icon className="size-4 opacity-80" aria-hidden />
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FinancesManageSection() {
  const [tab, setTab] = useState<FinancesTab>("fundos");

  useEffect(() => {
    const readHash = () => {
      setTab(parseFinancesHash(window.location.hash));
    };

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const selectTab = (next: FinancesTab) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.hash = financesHashForTab(next);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Gestão</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Do recebimento ao banco — e o caixa que você registra à mão.
          </p>
        </div>
        <FinancesManageTabs value={tab} onChange={selectTab} />
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`financas-tab-${tab}`}
        className="min-h-48"
      >
        {tab === "fundos" ? (
          <GivingFundsPanel />
        ) : tab === "contribuicoes" ? (
          <GivingDonationsPanel embedded />
        ) : tab === "mensais" ? (
          <GivingSubscriptionsPanel />
        ) : tab === "repasses" ? (
          <ConnectPayoutsPanel />
        ) : (
          <FinanceEntriesPanel embedded />
        )}
      </div>
    </section>
  );
}

function FinancesContent() {
  const { user, permissions } = useAuth();
  const { locked } = useFeatureLock();
  const isOwner = Boolean(user?.isOwner);
  const canManage = isOwner || Boolean(permissions?.finances.manage);
  const { data: connect, isPending: connectPending } = useConnectStatus();
  const { data: summary } = usePaymentsSummary();
  const openDashboard = useOpenExpressDashboard();
  const canOpenStripeDashboard = Boolean(
    isOwner &&
      (summary?.canReceivePayments || connect?.detailsSubmitted),
  );

  if (locked) {
    return <FinancesLockedCard isOwner={isOwner} />;
  }

  if (isOwner && connectPending) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando situação dos recebimentos...
      </div>
    );
  }

  if (isOwner && connect && !connect.canReceivePayments) {
    const copy = ownerActivationCopy(connect.onboardingStatus);

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

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {summary?.canReceivePayments ? (
            <Badge variant="success">Conta ativa</Badge>
          ) : (
            <Badge variant="outline">Recebimentos indisponíveis</Badge>
          )}
          <p className="text-sm text-muted-foreground">
            Resumo dos fundos e contribuições. Membros doam em{" "}
            <Link
              href={AUTH_ROUTES.tithesOfferings}
              className="font-medium text-foreground underline underline-offset-2"
            >
              Dízimos e ofertas
            </Link>
            .
          </p>
        </div>
        {canOpenStripeDashboard ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={stripeOutlineButtonClassName()}
            disabled={openDashboard.isPending}
            onClick={() => openDashboard.mutate()}
            aria-label="Abrir painel Stripe"
          >
            {openDashboard.isPending ? (
              <Loader2 className="size-3.5 animate-spin text-stripe" aria-hidden />
            ) : (
              <>
                <span>Painel</span>
                <StripeWordmark size="md" title={false} />
              </>
            )}
            {openDashboard.isPending ? "Abrindo…" : null}
          </Button>
        ) : null}
      </div>

      {openDashboard.isError ? (
        <FormAlert>
          {resolvePaymentsError(
            openDashboard.error,
            "Não foi possível abrir o painel Stripe.",
          )}
        </FormAlert>
      ) : null}

      <FinancesSummaryCards />

      {canManage ? (
        <FinancesManageSection />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          Você tem acesso ao resumo financeiro. Para criar fundos e ver o
          histórico detalhado de contribuições, é necessária a permissão
          “Gerenciar recebimentos”.
        </div>
      )}
    </div>
  );
}

export default function FinancasPage() {
  return (
    <RequirePermission permission="finances">
      <DashboardPage
        title="Finanças"
        subtitle="Resumo dos recebimentos e gestão de fundos"
      >
        <FinancesContent />
      </DashboardPage>
    </RequirePermission>
  );
}
