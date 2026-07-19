"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
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
import {
  StripeWordmark,
  stripeOutlineButtonClassName,
} from "@/components/brand/stripe-mark";
import { SubscribePricingTrigger } from "@/components/billing/subscribe-pricing-trigger";
import { DashboardPage } from "@/components/dashboard/dashboard-shell";
import { DashboardPageIntro } from "@/components/dashboard/dashboard-page-intro";
import { ChartOfAccountsPanel } from "@/components/dashboard/finances/chart-of-accounts-panel";
import { ConnectPayoutsPanel } from "@/components/dashboard/finances/connect-payouts-panel";
import { FinanceEntriesPanel } from "@/components/dashboard/finances/finance-entries-panel";
import { FinancesSummaryCards } from "@/components/dashboard/finances/finances-summary-cards";
import { GivingDonationsPanel } from "@/components/dashboard/finances/giving-donations-panel";
import { GivingFundsPanel } from "@/components/dashboard/finances/giving-funds-panel";
import { GivingSubscriptionsPanel } from "@/components/dashboard/finances/giving-subscriptions-panel";
import { PeriodCloseBar } from "@/components/dashboard/finances/period-close-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { AUTH_ROUTES, settingsSectionPath } from "@/constants/routes";
import type { ConnectOnboardingStatus } from "@/lib/api/payments";
import {
  resolvePaymentsError,
  useConnectStatus,
  useOpenExpressDashboard,
  usePaymentsSummary,
} from "@/lib/api/queries";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type FinancesTab =
  | "fundos"
  | "contribuicoes"
  | "mensais"
  | "repasses"
  | "caixa"
  | "contas";

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
  if (hash === "#contas" || hash === "#plano-de-contas") {
    return "contas";
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
    case "contas":
      return "#contas";
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
    icon: typeof PiggyBank;
  }> = [
    { id: "fundos", label: "Fundos", icon: PiggyBank },
    { id: "contribuicoes", label: "Entradas", icon: Receipt },
    { id: "mensais", label: "Recorrentes", icon: RefreshCw },
    { id: "repasses", label: "Repasses", icon: Building2 },
    { id: "caixa", label: "Lançamentos", icon: NotebookPen },
    { id: "contas", label: "Plano de contas", icon: BookOpen },
  ];

  return (
    <div
      role="tablist"
      aria-label="Gestão financeira"
      className={cn(
        "flex w-full gap-0.5 overflow-x-auto overscroll-x-contain rounded-xl border border-border/80 bg-muted/30 p-1",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
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
              "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
              selected
                ? "bg-foreground font-medium text-background"
                : "font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Icon
              className={cn("size-3.5", selected ? "opacity-100" : "opacity-70")}
              aria-hidden
            />
            {tab.label}
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
      <header className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Gestão
          </h2>
          <div className="mt-2.5 h-px w-8 bg-domain-finances" />
          <p className="mt-2.5 text-sm text-muted-foreground">
            Do recebimento ao banco — caixa, contas e fechamento do mês.
          </p>
        </div>
        <FinancesManageTabs value={tab} onChange={selectTab} />
      </header>

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
        ) : tab === "contas" ? (
          <ChartOfAccountsPanel embedded />
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

  const needsConnectActivation = Boolean(
    isOwner && connect && !connect.canReceivePayments,
  );
  const activationCopy = needsConnectActivation
    ? ownerActivationCopy(connect!.onboardingStatus)
    : null;

  return (
    <div className="space-y-10">
      <DashboardPageIntro
        eyebrow="Tesouraria"
        title="Finanças"
        description="Recebimentos, caixa e fechamento do mês."
        domain="finances"
      />

      {activationCopy ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted">
                <Landmark className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight">
                  {activationCopy.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {activationCopy.description} Enquanto isso, você já pode
                  usar o caixa, o plano de contas e fechar o mês.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 gap-2">
              <Link href={settingsSectionPath("recebimentos")}>
                {activationCopy.cta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {summary?.canReceivePayments ? (
            <Badge variant="success">Conta ativa</Badge>
          ) : (
            <Badge variant="outline">Recebimentos online pendentes</Badge>
          )}
          <p className="text-sm text-muted-foreground">
            Resumo do mês, caixa e prestação de contas. Membros doam em{" "}
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

      <PeriodCloseBar />

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
        subtitle="Recebimentos, caixa e fechamento do mês"
      >
        <FinancesContent />
      </DashboardPage>
    </RequirePermission>
  );
}
