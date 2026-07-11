"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Loader2, MousePointerClick } from "lucide-react";

import { BusyOverlay } from "@/components/ui/busy-overlay";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsSectionPath } from "@/constants/routes";
import {
  usePasswordResetRequests,
  useResetMemberPassword,
} from "@/lib/api/queries";
import { formatDateTime } from "@/lib/utils";
import type { PasswordResetRequest } from "@/types/church-memberships";

import {
  SettingsEmptyState,
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";

function PasswordResetRequestRow({
  request,
  onGenerate,
  isGenerating,
}: {
  request: PasswordResetRequest;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const contact = request.email ?? request.phone ?? "Sem e-mail cadastrado";

  return (
    <div className="border-b border-border/70 px-5 py-4 last:border-b-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{request.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{contact}</p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Login</dt>
              <dd className="mt-0.5 font-mono text-sm">{request.login}</dd>
            </div>
            {request.cpf && (
              <div>
                <dt className="text-xs text-muted-foreground">CPF</dt>
                <dd className="mt-0.5 font-mono text-sm">{request.cpf}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Solicitado em</dt>
              <dd className="mt-0.5 text-sm">{formatDateTime(request.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="w-full shrink-0 lg:w-72">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar nova senha"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PasswordResetRequestsSettings() {
  const { data, isLoading, isError, error } = usePasswordResetRequests();
  const resetPassword = useResetMemberPassword();
  const [generatingUserId, setGeneratingUserId] = useState<string | null>(null);

  async function handleGenerate(userId: string) {
    setGeneratingUserId(userId);

    try {
      await resetPassword.mutateAsync(userId);
    } finally {
      setGeneratingUserId(null);
    }
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Solicitações de senha"
        description="Usuários sem e-mail cadastrado que pediram recuperação de senha. Gere uma nova senha temporária e repasse o acesso."
      />

      <SettingsPanel className="relative">
        <BusyOverlay
          active={generatingUserId !== null}
          icon={KeyRound}
          steps={[
            "Gerando nova senha temporária...",
            "Atualizando o acesso...",
          ]}
          hint="A senha ficará disponível em Últimos usuários adicionados."
        />
        <div className="border-b border-border/70 bg-muted/20 px-5 py-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
              <KeyRound className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">
              Gere uma nova senha temporária e repasse o acesso ao usuário. Você
              pode verificar a senha gerada em{" "}
              <Link
                href={settingsSectionPath("pending-users")}
                className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
              >
                Últimos usuários adicionados
                <MousePointerClick className="size-3.5 shrink-0" aria-hidden />
              </Link>
              .
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
            <SettingsEmptyState message="Nenhuma solicitação pendente no momento." />
          </div>
        )}

        {!isLoading &&
          !isError &&
          data?.map((request) => (
            <PasswordResetRequestRow
              key={request.id}
              request={request}
              onGenerate={() => handleGenerate(request.userId)}
              isGenerating={generatingUserId === request.userId}
            />
          ))}
      </SettingsPanel>
    </div>
  );
}
