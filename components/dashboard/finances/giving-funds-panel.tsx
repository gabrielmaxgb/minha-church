"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Lock,
  Plus,
  Power,
  QrCode,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  FundPaymentMethodsField,
  PaymentMethodSummary,
  fundPaymentMethodsSelected,
  paymentMethodLabels,
} from "@/components/dashboard/finances/fund-payment-methods-field";
import { FundQrModal } from "@/components/dashboard/finances/fund-qr-modal";
import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { givingFundPath, settingsSectionPath } from "@/constants/routes";
import {
  resolvePaymentsError,
  useConnectStatus,
  useCreateGivingFund,
  useDeleteGivingFund,
  useFiscalProfile,
  useGivingFunds,
  useUpdateGivingFund,
} from "@/lib/api/queries";
import type {
  GivingFund,
  GivingFundAudience,
  GivingFundPaymentMethods,
} from "@/lib/api/payments";
import { isOwnerOnboardingMinimumComplete } from "@/lib/payments/fiscal-profile-completeness";
import { partitionGivingFundsByAudience } from "@/lib/finances/partition-giving-funds";
import { toastError, toastSuccess } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const EMPTY_METHODS: GivingFundPaymentMethods = {
  pix: false,
  card: false,
  boleto: false,
};

export function GivingFundsPanel() {
  const { user, church, permissions } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const fundsQuery = useGivingFunds();
  const fiscalProfile = useFiscalProfile();
  const connectQuery = useConnectStatus({ enabled: true });
  const createFund = useCreateGivingFund();
  const deleteFund = useDeleteGivingFund();
  const updateFund = useUpdateGivingFund();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<GivingFundAudience>("public");
  const [paymentMethods, setPaymentMethods] =
    useState<GivingFundPaymentMethods>(EMPTY_METHODS);
  const [methodsFormKey, setMethodsFormKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [fundToDelete, setFundToDelete] = useState<GivingFund | null>(null);
  const [fundToDeactivate, setFundToDeactivate] = useState<GivingFund | null>(
    null,
  );
  const [fundForQr, setFundForQr] = useState<GivingFund | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedFundId, setCopiedFundId] = useState<string | null>(null);
  const [didAutoOpenCreate, setDidAutoOpenCreate] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const funds = fundsQuery.data ?? [];
  const { publicFunds, memberFunds } = partitionGivingFundsByAudience(funds);
  const isOwner = Boolean(user?.isOwner);
  const canManage = isOwner || Boolean(permissions?.finances.manage);
  const churchSlug = church?.slug;
  const profileReady =
    !isOwner ||
    isOwnerOnboardingMinimumComplete(fiscalProfile.data ?? null);
  const methodsReady = fundPaymentMethodsSelected(
    paymentMethods,
    connectQuery.data,
  );
  const canShowCreate = canManage && profileReady;

  useEffect(() => {
    if (didAutoOpenCreate || fundsQuery.isPending || !canShowCreate) {
      return;
    }
    if (funds.length === 0) {
      setCreateOpen(true);
      setDidAutoOpenCreate(true);
    }
  }, [
    canShowCreate,
    didAutoOpenCreate,
    funds.length,
    fundsQuery.isPending,
  ]);

  const fundHref = (fund: GivingFund) =>
    fund.audience === "public" && churchSlug
      ? givingFundPath(churchSlug, fund.slug)
      : null;

  const resetCreateForm = () => {
    setName("");
    setDescription("");
    setAudience("public");
    setPaymentMethods(EMPTY_METHODS);
    setMethodsFormKey((key) => key + 1);
  };

  const handleCopyLink = async (fund: GivingFund) => {
    const path = fundHref(fund);
    if (!path) {
      return;
    }

    const url = `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      toastSuccess("Link copiado.");
      setCopiedFundId(fund.id);
      window.setTimeout(() => {
        setCopiedFundId((current) => (current === fund.id ? null : current));
      }, 2000);
    } catch {
      toastError("Não foi possível copiar o link.");
    }
  };

  const handleCreate = async () => {
    if (!methodsReady) {
      toastError("Selecione pelo menos um meio de pagamento disponível.");
      return;
    }

    try {
      await createFund.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        audience,
        allowPix: paymentMethods.pix,
        allowCard: paymentMethods.card,
        allowBoleto: paymentMethods.boleto,
      });
      resetCreateForm();
      setCreateOpen(false);
      toastSuccess("Fundo criado.");
    } catch (createError) {
      toastError(
        resolvePaymentsError(createError, "Não foi possível criar o fundo."),
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!fundToDelete) {
      return;
    }

    try {
      await deleteFund.mutateAsync(fundToDelete.id);
      setFundToDelete(null);
      toastSuccess("Fundo excluído.");
    } catch (deleteError) {
      toastError(
        resolvePaymentsError(deleteError, "Não foi possível excluir o fundo."),
      );
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!fundToDeactivate) {
      return;
    }

    setTogglingId(fundToDeactivate.id);

    try {
      await updateFund.mutateAsync({
        fundId: fundToDeactivate.id,
        input: { isActive: false },
      });
      setFundToDeactivate(null);
      toastSuccess("Fundo desativado.");
    } catch (toggleError) {
      toastError(
        resolvePaymentsError(
          toggleError,
          "Não foi possível desativar o fundo.",
        ),
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleReactivate = async (fund: GivingFund) => {
    setTogglingId(fund.id);

    try {
      await updateFund.mutateAsync({
        fundId: fund.id,
        input: { isActive: true },
      });
      toastSuccess("Fundo reativado.");
    } catch (toggleError) {
      toastError(
        resolvePaymentsError(
          toggleError,
          "Não foi possível reativar o fundo.",
        ),
      );
    } finally {
      setTogglingId(null);
    }
  };

  if (fundsQuery.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  if (fundsQuery.isError) {
    return (
      <FormAlert>
        Não foi possível carregar os fundos de cobrança. Recarregue a página.
      </FormAlert>
    );
  }

  return (
    <div className="space-y-5">
      <div className="min-w-0">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Fundos cadastrados
        </h2>
        <div className="mt-2.5 h-px w-8 bg-domain-finances" aria-hidden />
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          Destinos de Pix, cartão e boleto. Compartilháveis têm link e QR code;
          os demais só aparecem em Dízimos e ofertas.
        </p>
      </div>

      {canManage && isOwner && !profileReady ? (
        <FormAlert>
          <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-1">
            Complete o perfil da igreja (contato, cidade/UF e dados fiscais)
            antes de criar fundos.
            <Link
              href={settingsSectionPath("general")}
              className="font-medium text-foreground underline underline-offset-2"
            >
              Ir para Geral
            </Link>
          </span>
        </FormAlert>
      ) : null}

      {canShowCreate ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <button
            type="button"
            aria-expanded={createOpen}
            onClick={() => {
              setCreateOpen((open) => !open);
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/35"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-domain-finances-subtle text-domain-finances-foreground">
              <Plus className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                Novo fundo
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Defina nome, público e meios de pagamento
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                createOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          <AnimatePresence initial={false}>
            {createOpen ? (
              <motion.div
                key="create-fund"
                initial={
                  shouldReduceMotion
                    ? false
                    : { height: 0, opacity: 0 }
                }
                animate={{ height: "auto", opacity: 1 }}
                exit={
                  shouldReduceMotion
                    ? undefined
                    : { height: 0, opacity: 0 }
                }
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-4 border-t border-border px-4 py-4 sm:px-5">
                  <FormField label="Nome" htmlFor="fund-name" required>
                    <Input
                      id="fund-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ex.: Missões"
                      disabled={createFund.isPending}
                      autoFocus
                    />
                  </FormField>
                  <FormField label="Descrição" htmlFor="fund-description">
                    <Input
                      id="fund-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Opcional"
                      disabled={createFund.isPending}
                    />
                  </FormField>

                  <fieldset className="space-y-2.5">
                    <legend className="text-sm font-medium text-foreground">
                      Quem pode contribuir?
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(
                        [
                          {
                            value: "public" as const,
                            title: "Compartilhável (recomendado)",
                            body: "Qualquer pessoa paga pelo link; se estiver logado, vincula à ficha.",
                          },
                          {
                            value: "members" as const,
                            title: "Só membros (sem link)",
                            body: "Aparece só em Dízimos e ofertas — sem URL pública.",
                          },
                        ] as const
                      ).map((option) => {
                        const selected = audience === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setAudience(option.value)}
                            disabled={createFund.isPending}
                            className={cn(
                              "rounded-xl border px-3.5 py-3 text-left transition-colors",
                              selected
                                ? "border-foreground/20 bg-domain-finances-subtle shadow-xs"
                                : "border-border bg-surface-elevated/50 hover:border-foreground/12",
                            )}
                          >
                            <span className="block text-sm font-medium text-foreground">
                              {option.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                              {option.body}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <FundPaymentMethodsField
                    key={methodsFormKey}
                    value={paymentMethods}
                    onChange={setPaymentMethods}
                    connect={connectQuery.data}
                    disabled={createFund.isPending}
                  />

                  <div className="flex flex-col-reverse gap-2 border-t border-border/80 pt-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={createFund.isPending}
                      onClick={() => {
                        setCreateOpen(false);
                        resetCreateForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="gap-2"
                      disabled={
                        createFund.isPending ||
                        name.trim().length < 2 ||
                        !methodsReady
                      }
                      onClick={() => void handleCreate()}
                    >
                      {createFund.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      Criar fundo
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      {funds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground">
          Nenhum fundo ainda.
          {canShowCreate
            ? " Abra “Novo fundo” acima para cadastrar o primeiro."
            : canManage
              ? " Complete o perfil da igreja para cadastrar."
              : " Peça a quem gerencia recebimentos para cadastrar."}
        </div>
      ) : (
        <div className="space-y-8">
          {publicFunds.length > 0 ? (
            <FundAudienceSection
              title="Compartilháveis"
              subtitle="Link e QR code para qualquer pessoa contribuir."
              tone="public"
            >
              {publicFunds.map((fund) => {
                const href = fundHref(fund);
                const showShare = fund.isActive && Boolean(href);
                const justCopied = copiedFundId === fund.id;
                const pathLabel = href?.replace(/^\//, "") ?? null;

                return (
                  <FundCard
                    key={fund.id}
                    fund={fund}
                    tone="public"
                    pathLabel={pathLabel}
                    actions={
                      <>
                        {showShare ? (
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              className="h-9 w-full gap-2"
                              onClick={() => void handleCopyLink(fund)}
                            >
                              {justCopied ? (
                                <Check className="size-4" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                              {justCopied ? "Copiado" : "Copiar link"}
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="h-9 gap-2 border-domain-finances/25 text-domain-finances-foreground hover:bg-domain-finances-subtle"
                                onClick={() => {
                                  setFundForQr(fund);
                                }}
                              >
                                <QrCode className="size-4" />
                                QR code
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-9 gap-2"
                                asChild
                              >
                                <a
                                  href={href!}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLink className="size-4" />
                                  Abrir
                                </a>
                              </Button>
                            </div>
                          </div>
                        ) : null}
                        <div className="flex justify-end">
                          <FundManageActions
                            fund={fund}
                            canManage={canManage}
                            isPending={
                              deleteFund.isPending || updateFund.isPending
                            }
                            togglingId={togglingId}
                            onDelete={() => {
                              setFundToDelete(fund);
                            }}
                            onDeactivate={() => {
                              setFundToDeactivate(fund);
                            }}
                            onReactivate={() => void handleReactivate(fund)}
                          />
                        </div>
                      </>
                    }
                  />
                );
              })}
            </FundAudienceSection>
          ) : null}

          {memberFunds.length > 0 ? (
            <FundAudienceSection
              title="Só para membros"
              subtitle="Aparecem em Dízimos e ofertas — sem link externo."
              tone="members"
            >
              {memberFunds.map((fund) => (
                <FundCard
                  key={fund.id}
                  fund={fund}
                  tone="members"
                  actions={
                    <div className="flex justify-end">
                      <FundManageActions
                        fund={fund}
                        canManage={canManage}
                        isPending={
                          deleteFund.isPending || updateFund.isPending
                        }
                        togglingId={togglingId}
                        onDelete={() => {
                          setFundToDelete(fund);
                        }}
                        onDeactivate={() => {
                          setFundToDeactivate(fund);
                        }}
                        onReactivate={() => void handleReactivate(fund)}
                      />
                    </div>
                  }
                />
              ))}
            </FundAudienceSection>
          ) : null}
        </div>
      )}

      {fundToDelete ? (
        <FundConfirmDialog
          title="Excluir fundo?"
          description={
            <>
              O fundo{" "}
              <span className="font-medium text-foreground">
                {fundToDelete.name}
              </span>{" "}
              será removido permanentemente. Essa ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir fundo"
          confirmingLabel="Excluindo..."
          destructive
          isPending={deleteFund.isPending}
          onCancel={() => {
            if (!deleteFund.isPending) {
              setFundToDelete(null);
            }
          }}
          onConfirm={() => void handleConfirmDelete()}
        />
      ) : null}

      {fundToDeactivate ? (
        <FundConfirmDialog
          title="Desativar fundo?"
          description={
            <>
              O fundo{" "}
              <span className="font-medium text-foreground">
                {fundToDeactivate.name}
              </span>{" "}
              deixa de receber novas contribuições. O histórico é preservado.
            </>
          }
          confirmLabel="Desativar fundo"
          confirmingLabel="Desativando..."
          isPending={updateFund.isPending && togglingId === fundToDeactivate.id}
          onCancel={() => {
            if (!updateFund.isPending) {
              setFundToDeactivate(null);
            }
          }}
          onConfirm={() => void handleConfirmDeactivate()}
        />
      ) : null}

      {fundForQr && fundHref(fundForQr) && origin ? (
        <FundQrModal
          open
          onClose={() => setFundForQr(null)}
          fundName={fundForQr.name}
          fundDescription={fundForQr.description}
          churchName={church?.name ?? "Sua igreja"}
          url={`${origin}${fundHref(fundForQr)}`}
        />
      ) : null}
    </div>
  );
}

function FundAudienceSection({
  title,
  subtitle,
  tone,
  children,
}: {
  title: string;
  subtitle: string;
  tone: "public" | "members";
  children: React.ReactNode;
}) {
  const isPublic = tone === "public";

  return (
    <section className="space-y-3.5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
            isPublic
              ? "bg-domain-finances-subtle text-domain-finances-foreground"
              : "bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          {isPublic ? (
            <Link2 className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <div
            className={cn(
              "mt-2 h-px w-8",
              isPublic ? "bg-domain-finances" : "bg-foreground/20",
            )}
            aria-hidden
          />
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>
    </section>
  );
}

function FundCard({
  fund,
  tone,
  pathLabel,
  actions,
}: {
  fund: GivingFund;
  tone: "public" | "members";
  pathLabel?: string | null;
  actions: React.ReactNode;
}) {
  const isPublic = tone === "public";
  const hasMethods = paymentMethodLabels(fund.paymentMethods).length > 0;

  return (
    <li
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-xs",
        isPublic
          ? "border-domain-finances/25"
          : "border-border",
        !fund.isActive && "opacity-65",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b to-transparent",
          isPublic
            ? "from-domain-finances-subtle/80"
            : "from-muted/60",
        )}
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl",
              fund.isActive
                ? isPublic
                  ? "bg-domain-finances-subtle text-domain-finances-foreground"
                  : "bg-muted text-muted-foreground"
                : "bg-muted text-muted-foreground",
            )}
            aria-hidden
          >
            {isPublic ? (
              <Link2 className="size-5" />
            ) : (
              <Lock className="size-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h4
                className={cn(
                  "font-display text-lg font-semibold tracking-tight text-foreground",
                  !fund.isActive && "text-muted-foreground",
                )}
              >
                {fund.name}
              </h4>
              {!fund.isActive ? (
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Desativado
                </span>
              ) : null}
            </div>
            {fund.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {fund.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto space-y-2.5">
          {hasMethods ? (
            <PaymentMethodSummary methods={fund.paymentMethods} />
          ) : null}
          {pathLabel ? (
            <p className="truncate rounded-lg bg-foreground/4 px-2.5 py-1.5 font-mono text-[11px] tracking-tight text-muted-foreground">
              {pathLabel}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-border/70 pt-4">{actions}</div>
      </div>
    </li>
  );
}

function FundManageActions({
  fund,
  canManage,
  isPending,
  togglingId,
  onDelete,
  onDeactivate,
  onReactivate,
}: {
  fund: GivingFund;
  canManage: boolean;
  isPending: boolean;
  togglingId: string | null;
  onDelete: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  if (!canManage) {
    return null;
  }

  if (fund.canDelete) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-destructive hover:bg-destructive/5 hover:text-destructive"
        disabled={isPending}
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
        Excluir
      </Button>
    );
  }

  if (fund.isActive) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
        disabled={isPending}
        onClick={onDeactivate}
      >
        <Power className="size-3.5" />
        Desativar
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      disabled={isPending || togglingId === fund.id}
      onClick={onReactivate}
    >
      {togglingId === fund.id ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Power className="size-3.5" />
      )}
      Reativar
    </Button>
  );
}

function FundConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmingLabel,
  destructive = false,
  isPending,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  confirmingLabel: string;
  destructive?: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        disabled={isPending}
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fund-confirm-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-background p-6 shadow-popover sm:rounded-2xl"
      >
        <div
          className={
            destructive
              ? "flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
              : "flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
          }
        >
          {destructive ? (
            <Trash2 className="size-5" aria-hidden />
          ) : (
            <Power className="size-5" aria-hidden />
          )}
        </div>

        <h2
          id="fund-confirm-title"
          className="mt-4 text-lg font-semibold tracking-tight"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
            className="w-full gap-2 sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : destructive ? (
              <Trash2 className="size-4" />
            ) : (
              <Power className="size-4" />
            )}
            {isPending ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
