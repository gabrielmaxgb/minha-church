"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  HelpCircle,
  Landmark,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  resolvePaymentsError,
  useConnectStatus,
  useFiscalProfile,
  useResumeConnectOnboarding,
  useStartConnectOnboarding,
  useSyncConnectAccount,
} from "@/lib/api/queries";
import type {
  ConnectCapabilityStatus,
  ConnectOnboardingStatus,
  ConnectStatus,
  FiscalProfile,
} from "@/lib/api/payments";
import {
  isOwnerOnboardingMinimumComplete,
  listFiscalFieldStatusForConnect,
} from "@/lib/payments/fiscal-profile-completeness";
import {
  buildReceivablesHelpHref,
  receivablesHelpChannelLabel,
} from "@/lib/support/receivables-help";
import { settingsSectionPath } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import type { BadgeProps } from "@/components/ui/badge";

import { SettingsPanel, SettingsSectionHeader } from "./settings-shared";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

const STATUS_META: Record<
  ConnectOnboardingStatus,
  { label: string; variant: BadgeVariant }
> = {
  none: { label: "Não ativado", variant: "outline" },
  created: { label: "Cadastro iniciado", variant: "secondary" },
  onboarding: { label: "Cadastro em andamento", variant: "secondary" },
  verifying: { label: "Em verificação", variant: "attention" },
  active: { label: "Ativo", variant: "success" },
  restricted: { label: "Pendências", variant: "attention" },
  rejected: { label: "Recusado", variant: "danger" },
};

const CAPABILITY_META: Record<
  ConnectCapabilityStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Ativo", variant: "success" },
  pending: { label: "Em análise", variant: "attention" },
  inactive: { label: "Indisponível", variant: "outline" },
};

const CAPABILITY_LABELS: { key: "pix" | "card" | "boleto"; label: string }[] = [
  { key: "pix", label: "Pix" },
  { key: "card", label: "Cartão" },
  { key: "boleto", label: "Boleto" },
];

function ConnectOnboardingCard({
  status,
  fiscalProfile,
}: {
  status: ConnectStatus | undefined;
  fiscalProfile: FiscalProfile | null;
}) {
  const { user, church } = useAuth();
  const start = useStartConnectOnboarding();
  const resume = useResumeConnectOnboarding();
  const sync = useSyncConnectAccount();
  const [actionError, setActionError] = useState<string | null>(null);
  const [leavingToStripe, setLeavingToStripe] = useState(false);

  const onboardingStatus = status?.onboardingStatus ?? "none";
  const meta = STATUS_META[onboardingStatus];
  const redirecting =
    leavingToStripe || start.isPending || resume.isPending;
  const needsFiscalGate =
    onboardingStatus === "none" ||
    (onboardingStatus === "created" && !status?.hasAccount);

  const fieldStatus = listFiscalFieldStatusForConnect(fiscalProfile);
  const savedReady = isOwnerOnboardingMinimumComplete(fiscalProfile);
  const canStart = !needsFiscalGate || savedReady;
  const showChecklist = needsFiscalGate && !canStart;
  const showHelpCta = onboardingStatus !== "active";
  const helpChannel = receivablesHelpChannelLabel();
  const generalHref = settingsSectionPath("general");

  const handleStart = async () => {
    setActionError(null);
    setLeavingToStripe(true);
    try {
      await start.mutateAsync();
    } catch (error) {
      setLeavingToStripe(false);
      setActionError(resolvePaymentsError(error));
    }
  };

  const handleResume = async () => {
    setActionError(null);
    setLeavingToStripe(true);
    try {
      await resume.mutateAsync();
    } catch (error) {
      setLeavingToStripe(false);
      setActionError(resolvePaymentsError(error));
    }
  };

  const handleSync = async () => {
    setActionError(null);
    try {
      await sync.mutateAsync();
    } catch (error) {
      setActionError(resolvePaymentsError(error));
    }
  };

  const handleRequestHelp = () => {
    if (!church || !user) {
      return;
    }

    const href = buildReceivablesHelpHref({
      churchName: church.name,
      churchId: church.id,
      ownerName: user.name,
      ownerEmail: user.email ?? null,
      onboardingStatus,
    });

    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <SettingsPanel>
      <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Landmark className="size-4" aria-hidden />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Conta de recebimentos</h3>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {onboardingStatus === "active"
                ? "Sua igreja já pode receber pagamentos de membros pelo Minha Church."
                : "Ative os recebimentos para coletar dízimos, doações e inscrições em eventos."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {onboardingStatus === "active" && status && (
          <div className="grid gap-2 sm:grid-cols-3">
            {CAPABILITY_LABELS.map(({ key, label }) => {
              const capability = CAPABILITY_META[status.capabilities[key]];
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
                >
                  <span className="text-sm">{label}</span>
                  <Badge variant={capability.variant}>{capability.label}</Badge>
                </div>
              );
            })}
          </div>
        )}

        {showChecklist && (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              Complete o perfil da igreja em Geral
            </p>
            <p className="mt-1 text-muted-foreground">
              Contato, cidade/UF e identificação fiscal ficam em Configurações
              → Geral. Depois de salvar, volte aqui para ativar.
            </p>
            <ul className="mt-3 space-y-2" aria-label="Campos obrigatórios">
              {fieldStatus.map((item) => (
                <li key={item.field} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                      item.done
                        ? "border-success bg-success text-white"
                        : "border-muted-foreground/35 bg-background",
                    )}
                    aria-hidden
                  >
                    {item.done ? <Check className="size-3 stroke-3" /> : null}
                  </span>
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      item.done
                        ? "font-medium text-success-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="sr-only">
                    {item.done ? "preenchido" : "pendente"}
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-3 w-full gap-2 sm:w-auto">
              <Link href={generalHref}>Ir para Geral</Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Guardamos só a identidade fiscal da igreja no Minha Church.
              Endereço completo o Stripe coleta no cadastro.
            </p>
          </div>
        )}

        {(onboardingStatus === "verifying" ||
          onboardingStatus === "restricted") && (
          <div className="rounded-lg border border-attention-border bg-attention-subtle px-4 py-3 text-sm text-attention-foreground">
            {onboardingStatus === "verifying"
              ? "O Stripe está verificando os dados enviados. Isso pode levar alguns minutos. Você será notificado quando a conta for aprovada."
              : "O Stripe precisa de mais informações para liberar os recebimentos. Retome o cadastro para resolver as pendências."}
            {onboardingStatus === "restricted" &&
              status &&
              status.requirementsDue.length > 0 && (
                <span className="mt-1 block text-xs opacity-80">
                  {status.requirementsDue.length}{" "}
                  {status.requirementsDue.length === 1
                    ? "pendência"
                    : "pendências"}{" "}
                  a resolver.
                </span>
              )}
          </div>
        )}

        {onboardingStatus === "rejected" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
            O Stripe não aprovou esta conta de recebimentos. Entre em contato com
            o suporte para entender os próximos passos.
          </div>
        )}

        {actionError && <FormAlert>{actionError}</FormAlert>}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(onboardingStatus === "none" || onboardingStatus === "created") && (
            <Button
              type="button"
              className="w-full gap-2 sm:w-auto"
              disabled={redirecting || !canStart}
              aria-busy={redirecting}
              onClick={() => void handleStart()}
            >
              {redirecting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="size-4" aria-hidden />
              )}
              {redirecting
                ? "Abrindo cadastro no Stripe…"
                : "Ativar recebimentos"}
              {!redirecting && (
                <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              )}
            </Button>
          )}

          {(onboardingStatus === "onboarding" ||
            onboardingStatus === "restricted") && (
            <Button
              type="button"
              className="w-full gap-2 sm:w-auto"
              disabled={redirecting}
              aria-busy={redirecting}
              onClick={() => void handleResume()}
            >
              {redirecting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ExternalLink className="size-4" aria-hidden />
              )}
              {redirecting
                ? "Abrindo cadastro no Stripe…"
                : onboardingStatus === "restricted"
                  ? "Resolver pendências"
                  : "Continuar cadastro"}
            </Button>
          )}

          {onboardingStatus !== "none" && (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
              disabled={sync.isPending || redirecting}
              onClick={() => void handleSync()}
            >
              {sync.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4" aria-hidden />
              )}
              Atualizar situação
            </Button>
          )}
        </div>

        {redirecting && (
          <p className="text-sm text-muted-foreground" role="status">
            Aguarde — estamos preparando sua conta e vamos te levar ao cadastro
            seguro do Stripe.
          </p>
        )}

        {showHelpCta && (
          <div className="rounded-lg border border-border/70 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Travou no cadastro ou prefere fazer junto com a gente?
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full gap-2 sm:w-auto"
              disabled={redirecting}
              onClick={handleRequestHelp}
            >
              <HelpCircle className="size-4" aria-hidden />
              Preciso de ajuda pra ativar
              <ExternalLink className="size-3.5 opacity-60" aria-hidden />
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Abre {helpChannel} com os dados da igreja já preenchidos pra gente
              te atender mais rápido.
            </p>
          </div>
        )}

        {showChecklist && (
          <p className="text-xs text-muted-foreground">
            O botão libera depois que o perfil estiver completo e salvo em
            Geral.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          O cadastro, a verificação de identidade e o processamento dos
          pagamentos são feitos com segurança pelo Stripe. As tarifas de
          processamento são cobradas pelo Stripe e o Minha Church não adiciona
          nenhuma taxa por transação neste momento. Pix, cartão e boleto só ficam
          disponíveis após a aprovação da conta.
        </p>
      </div>
    </SettingsPanel>
  );
}

export function ReceivablesSettings() {
  const { user } = useAuth();
  const connectStatus = useConnectStatus();
  const fiscalProfile = useFiscalProfile();

  const isLoading = connectStatus.isPending || fiscalProfile.isPending;

  const profile = useMemo(
    () => fiscalProfile.data ?? null,
    [fiscalProfile.data],
  );

  if (!user?.isOwner) {
    return null;
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Recebimentos"
        description="Ative e acompanhe a conta Stripe que recebe dízimos, doações e inscrições em eventos."
      />

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <div className="space-y-6">
          <ConnectOnboardingCard
            status={connectStatus.data}
            fiscalProfile={profile}
          />

          {connectStatus.isError && (
            <FormAlert>
              <span className="inline-flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Não foi possível carregar a situação dos recebimentos.
              </span>
            </FormAlert>
          )}

          {fiscalProfile.isError && (
            <FormAlert>
              Não foi possível verificar o perfil da igreja. Recarregue a página
              e tente novamente.
            </FormAlert>
          )}
        </div>
      )}
    </div>
  );
}
