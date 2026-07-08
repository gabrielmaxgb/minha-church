"use client";

import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingAccessUsers } from "@/lib/api/queries";
import { formatDateTime } from "@/lib/utils";
import type { PendingAccessUser } from "@/types/church-memberships";

import {
  SettingsEmptyState,
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";

function CopyValueButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 shrink-0"
      onClick={handleCopy}
      aria-label={label}
    >
      {copied ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <Copy className="size-4" />
      )}
    </Button>
  );
}

function PendingAccessRow({ user }: { user: PendingAccessUser }) {
  const contact = user.email ?? user.phone ?? "Sem contato";

  return (
    <div className="border-b border-border/70 px-5 py-4 last:border-b-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{user.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{contact}</p>
          <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Login</dt>
              <dd className="mt-0.5 break-all font-mono text-sm">{user.login}</dd>
            </div>
            {user.cpf && (
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">CPF</dt>
                <dd className="mt-0.5 break-all font-mono text-sm">{user.cpf}</dd>
              </div>
            )}
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Adicionado em</dt>
              <dd className="mt-0.5 text-sm">{formatDateTime(user.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="w-full shrink-0 lg:w-72">
          <p className="text-xs font-medium text-muted-foreground">
            Senha temporária
          </p>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <code className="flex-1 truncate text-sm">{user.temporaryPassword}</code>
            <CopyValueButton
              value={user.temporaryPassword}
              label={`Copiar senha de ${user.name}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PendingUsersSettings() {
  const { data, isLoading, isError, error } = usePendingAccessUsers();

  return (
    <div>
      <SettingsSectionHeader
        title="Últimos usuários adicionados"
        description="Pessoas que ainda não trocaram a senha temporária. Use esta lista para repassar o acesso. Para quem já trocou e perdeu a senha, veja Solicitações de senha ou use Gerar nova senha quando disponível."
      />

      <SettingsPanel>
        <div className="border-b border-border/70 bg-muted/20 px-5 py-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
              <KeyRound className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">
              As senhas são armazenadas de forma segura e removidas automaticamente
              quando o usuário define uma nova senha. Aguarde alguns minutos após receber novos membros para ver a senha.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3 px-5 py-5">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {isError && (
          <div className="px-5 py-5">
            <SettingsEmptyState
              message={
                error instanceof Error
                  ? error.message
                  : "Não foi possível carregar. Tente novamente em instantes."
              }
            />
          </div>
        )}

        {!isLoading && !isError && (data?.length ?? 0) === 0 && (
          <div className="px-5 py-8">
            <SettingsEmptyState message="Nenhum acesso pendente. Todos os usuários recentes já trocaram a senha temporária." />
          </div>
        )}

        {!isLoading &&
          !isError &&
          data?.map((user) => <PendingAccessRow key={user.userId} user={user} />)}
      </SettingsPanel>
    </div>
  );
}
