"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, ExternalLink, Loader2, Plus, Power, Trash2 } from "lucide-react";

import {
  FundPaymentMethodsField,
  PaymentMethodBadges,
  fundPaymentMethodsSelected,
} from "@/components/dashboard/finances/fund-payment-methods-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES, givingFundPath, settingsSectionPath } from "@/constants/routes";
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
import { useAuth } from "@/providers/auth-provider";

function audienceLabel(audience: GivingFundAudience): string {
  return audience === "public" ? "Link público" : "Membros logados";
}

const EMPTY_METHODS: GivingFundPaymentMethods = {
  pix: false,
  card: false,
  boleto: false,
};

export function GivingFundsPanel() {
  const { user, church, permissions } = useAuth();
  const fundsQuery = useGivingFunds();
  const fiscalProfile = useFiscalProfile();
  const connectQuery = useConnectStatus({ enabled: true });
  const createFund = useCreateGivingFund();
  const deleteFund = useDeleteGivingFund();
  const updateFund = useUpdateGivingFund();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<GivingFundAudience>("members");
  const [paymentMethods, setPaymentMethods] =
    useState<GivingFundPaymentMethods>(EMPTY_METHODS);
  const [methodsFormKey, setMethodsFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fundToDelete, setFundToDelete] = useState<GivingFund | null>(null);
  const [fundToDeactivate, setFundToDeactivate] = useState<GivingFund | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const funds = fundsQuery.data ?? [];
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

  const fundHref = (fund: GivingFund) =>
    fund.audience === "public" && churchSlug
      ? givingFundPath(churchSlug, fund.slug)
      : null;

  const handleCopyLink = async (fund: GivingFund) => {
    const path = fundHref(fund);
    if (!path) {
      return;
    }

    const url = `${window.location.origin}${path}`;
    setError(null);

    try {
      await navigator.clipboard.writeText(url);
      setSuccess("Link copiado.");
    } catch {
      setError("Não foi possível copiar o link.");
    }
  };

  const handleCreate = async () => {
    setError(null);
    setSuccess(null);

    if (!methodsReady) {
      setError("Selecione pelo menos um meio de pagamento disponível.");
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
      setName("");
      setDescription("");
      setAudience("members");
      setPaymentMethods(EMPTY_METHODS);
      setMethodsFormKey((key) => key + 1);
      setSuccess("Fundo criado.");
    } catch (createError) {
      setError(
        resolvePaymentsError(createError, "Não foi possível criar o fundo."),
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!fundToDelete) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteFund.mutateAsync(fundToDelete.id);
      setFundToDelete(null);
      setSuccess("Fundo excluído.");
    } catch (deleteError) {
      setError(
        resolvePaymentsError(deleteError, "Não foi possível excluir o fundo."),
      );
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!fundToDeactivate) {
      return;
    }

    setError(null);
    setSuccess(null);
    setTogglingId(fundToDeactivate.id);

    try {
      await updateFund.mutateAsync({
        fundId: fundToDeactivate.id,
        input: { isActive: false },
      });
      setFundToDeactivate(null);
      setSuccess("Fundo desativado.");
    } catch (toggleError) {
      setError(
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
    setError(null);
    setSuccess(null);
    setTogglingId(fund.id);

    try {
      await updateFund.mutateAsync({
        fundId: fund.id,
        input: { isActive: true },
      });
      setSuccess("Fundo reativado.");
    } catch (toggleError) {
      setError(
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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Fundos de cobrança
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fundos para membros aparecem em Dízimos e ofertas. Fundos públicos
          geram link externo (sem vínculo de ficha pastoral).
        </p>
      </div>

      {error && <FormAlert>{error}</FormAlert>}
      {success && <FormAlert variant="success">{success}</FormAlert>}

      <ul className="divide-y divide-border rounded-xl border border-border">
        {funds.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">
            Nenhum fundo ainda.
            {canManage
              ? " Crie o primeiro abaixo (ex.: Dízimo, Oferta, Missões)."
              : " Peça a quem gerencia recebimentos para cadastrar."}
          </li>
        ) : (
          funds.map((fund) => (
            <li
              key={fund.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{fund.name}</p>
                  <Badge variant="outline">{audienceLabel(fund.audience)}</Badge>
                  {!fund.isActive && (
                    <Badge variant="outline">Desativado</Badge>
                  )}
                </div>
                {fund.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {fund.description}
                  </p>
                ) : null}
                <div className="mt-2">
                  <PaymentMethodBadges methods={fund.paymentMethods} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {fund.audience === "public" && churchSlug
                    ? `/doar/${churchSlug}/${fund.slug}`
                    : AUTH_ROUTES.tithesOfferings}
                  {!fund.canDelete ? " · Já recebeu contribuições" : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {fund.isActive && fund.audience === "public" && fundHref(fund) ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => void handleCopyLink(fund)}
                    >
                      <Copy className="size-3.5" />
                      Copiar link
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      asChild
                    >
                      <a
                        href={fundHref(fund)!}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="size-3.5" />
                        Abrir
                      </a>
                    </Button>
                  </>
                ) : null}
                {canManage ? (
                  <>
                    {fund.canDelete ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:bg-destructive/5 hover:text-destructive"
                        disabled={deleteFund.isPending || updateFund.isPending}
                        onClick={() => {
                          setError(null);
                          setSuccess(null);
                          setFundToDelete(fund);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        Excluir
                      </Button>
                    ) : fund.isActive ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={deleteFund.isPending || updateFund.isPending}
                        onClick={() => {
                          setError(null);
                          setSuccess(null);
                          setFundToDeactivate(fund);
                        }}
                      >
                        <Power className="size-3.5" />
                        Desativar
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={
                          deleteFund.isPending ||
                          updateFund.isPending ||
                          togglingId === fund.id
                        }
                        onClick={() => void handleReactivate(fund)}
                      >
                        {togglingId === fund.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Power className="size-3.5" />
                        )}
                        Reativar
                      </Button>
                    )}
                  </>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>

      {canManage && isOwner && !profileReady && (
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
      )}

      {canManage && profileReady && (
        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-foreground">Novo fundo</p>
          <FormField label="Nome" htmlFor="fund-name" required>
            <Input
              id="fund-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Missões"
              disabled={createFund.isPending}
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

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">
              Quem pode contribuir?
            </legend>
            <div className="space-y-3">
              {(
                [
                  {
                    value: "members" as const,
                    title: "Membros logados",
                    body: "Aparece em Dízimos e ofertas. O pagamento fica ligado à ficha do membro.",
                  },
                  {
                    value: "public" as const,
                    title: "Link público",
                    body: "Qualquer pessoa pode pagar sem login. Não há vínculo com membro cadastrado.",
                  },
                ] as const
              ).map((option) => {
                const inputId = `fund-audience-${option.value}`;
                return (
                  <label
                    key={option.value}
                    htmlFor={inputId}
                    className="flex cursor-pointer gap-3"
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name="fund-audience"
                      value={option.value}
                      checked={audience === option.value}
                      onChange={() => setAudience(option.value)}
                      disabled={createFund.isPending}
                      className="mt-1 size-4 shrink-0 accent-foreground"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {option.body}
                      </span>
                    </span>
                  </label>
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
      )}

      {fundToDelete && (
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
      )}

      {fundToDeactivate && (
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
      )}
    </div>
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
