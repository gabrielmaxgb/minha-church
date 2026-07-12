"use client";

import { useState } from "react";
import { Copy, ExternalLink, Loader2, Plus, Power, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { givingFundPath } from "@/constants/routes";
import {
  resolvePaymentsError,
  useCreateGivingFund,
  useDeleteGivingFund,
  useGivingFunds,
  useUpdateGivingFund,
} from "@/lib/api/queries";
import type { GivingFund } from "@/lib/api/payments";
import { useAuth } from "@/providers/auth-provider";

export function GivingFundsPanel() {
  const { user, church } = useAuth();
  const fundsQuery = useGivingFunds();
  const createFund = useCreateGivingFund();
  const deleteFund = useDeleteGivingFund();
  const updateFund = useUpdateGivingFund();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fundToDelete, setFundToDelete] = useState<GivingFund | null>(null);
  const [fundToDeactivate, setFundToDeactivate] = useState<GivingFund | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const funds = fundsQuery.data ?? [];
  const isOwner = Boolean(user?.isOwner);
  const churchSlug = church?.slug;

  const fundHref = (fund: GivingFund) =>
    churchSlug ? givingFundPath(churchSlug, fund.slug) : null;

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

    try {
      await createFund.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
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
          Categorias em que a igreja recebe. Cada fundo ativo tem um link
          público de contribuição (Pix, cartão, boleto conforme a conta).
        </p>
      </div>

      {error && <FormAlert>{error}</FormAlert>}
      {success && <FormAlert variant="success">{success}</FormAlert>}

      <ul className="divide-y divide-border rounded-xl border border-border">
        {funds.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">
            Nenhum fundo ainda.
            {isOwner
              ? " Crie o primeiro abaixo (ex.: Dízimo, Oferta, Missões)."
              : " Peça ao proprietário para cadastrar."}
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
                  {!fund.isActive && (
                    <Badge variant="outline">Desativado</Badge>
                  )}
                </div>
                {fund.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {fund.description}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {churchSlug
                    ? `/doar/${churchSlug}/${fund.slug}`
                    : `/${fund.slug}`}
                  {!fund.canDelete ? " · Já recebeu contribuições" : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {fund.isActive && fundHref(fund) && (
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
                )}
                {isOwner && (
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
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      {isOwner && (
        <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
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
          <Button
            type="button"
            className="gap-2"
            disabled={createFund.isPending || name.trim().length < 2}
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
              deixa de aparecer em novos links de pagamento. O histórico de
              contribuições é preservado.
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
