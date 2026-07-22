"use client";

import { useMemo } from "react";
import { History, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/lib/api/queries/use-audit-logs";
import type { AuditLogEntry } from "@/types/audit-logs";
import {
  CHURCH_PERMISSION_LABELS,
  type ChurchPermissionKey,
} from "@/types/church-roles";

import {
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";

const AUDIT_ACTION_LABELS: Record<string, string> = {
  "church.registered": "Igreja cadastrada",
  "church_role.created": "Cargo criado",
  "church_role.updated": "Cargo alterado",
  "church_role.deleted": "Cargo excluído",
  "membership.updated": "Acesso de usuário",
  "membership.password_reset": "Senha redefinida",
  "terms.accepted": "Termos aceitos",
  "dpa.accepted": "Adendo LGPD aceito",
  "privacy.purged": "Dados anonimizados",
  "church.closure_requested": "Encerramento solicitado",
  "church.closure_cancelled": "Encerramento cancelado",
  "user.account_deleted": "Conta excluída",
  "connect.onboarding_started": "Recebimentos iniciados",
  "connect.onboarding_resumed": "Recebimentos retomados",
  "fiscal_profile.updated": "Perfil fiscal",
  "giving_fund.created": "Fundo criado",
  "giving_fund.updated": "Fundo alterado",
  "giving_fund.deleted": "Fundo excluído",
  "finance_entry.created": "Lançamento criado",
  "finance_entry.updated": "Lançamento editado",
  "finance_entry.deleted": "Lançamento excluído",
  "financial_period.closed": "Período fechado",
  "financial_period.reopened": "Período reaberto",
  "giving_donation.refunded": "Contribuição estornada",
  "event_ticket.refunded": "Inscrição estornada",
};

function formatWhen(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "agora";
  }

  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `há ${diffHours}h`;
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatActionLabel(action: string) {
  return AUDIT_ACTION_LABELS[action] ?? "Atividade";
}

function formatPermissionLabel(value: string): string {
  if (value in CHURCH_PERMISSION_LABELS) {
    return CHURCH_PERMISSION_LABELS[value as ChurchPermissionKey];
  }

  // Updates já gravam o rótulo em PT; creates antigos podem ter a chave.
  return value;
}

function formatPermissionList(values: string[] | undefined): string {
  return (values ?? []).map(formatPermissionLabel).join(", ");
}

function MetadataDetails({ entry }: { entry: AuditLogEntry }) {
  const metadata = entry.metadata;

  if (!metadata) {
    return null;
  }

  const roles = metadata.roles as
    | { before?: string[]; after?: string[] }
    | undefined;
  const permissions = metadata.permissions as
    | { added?: string[]; removed?: string[] }
    | string[]
    | undefined;

  const added =
    permissions && !Array.isArray(permissions) ? permissions.added : undefined;
  const removed =
    permissions && !Array.isArray(permissions) ? permissions.removed : undefined;
  const permissionList = Array.isArray(permissions) ? permissions : undefined;

  return (
    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
      {roles?.before && roles?.after && (
        <p>
          Cargos: {roles.before.join(", ") || "—"} →{" "}
          {roles.after.join(", ") || "—"}
        </p>
      )}
      {permissionList && permissionList.length > 0 && (
        <p>Permissões: {formatPermissionList(permissionList)}</p>
      )}
      {added && added.length > 0 && (
        <p>+ {formatPermissionList(added)}</p>
      )}
      {removed && removed.length > 0 && (
        <p>− {formatPermissionList(removed)}</p>
      )}
    </div>
  );
}

export function ChurchActivitySettings() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAuditLogs();

  const entries = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const retentionDays = data?.pages[0]?.retentionDays ?? null;

  return (
    <div>
      <SettingsSectionHeader
        title="Atividade"
        description={
          retentionDays !== null
            ? `Histórico de cargos, acessos, recebimentos e finanças. Retenção: ${retentionDays} dias.`
            : "Histórico de cargos, acessos, recebimentos e finanças."
        }
      />

      <SettingsPanel>
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : isError ? (
          <p className="p-4 text-sm text-muted-foreground">
            Não foi possível carregar o histórico.
          </p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <History className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade registrada ainda.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {entries.map((entry) => (
              <li key={entry.id} className="px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {formatActionLabel(entry.action)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatWhen(entry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{entry.summary}</p>
                  {entry.actor && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.actor.name}
                    </p>
                  )}
                  <MetadataDetails entry={entry} />
                </div>
              </li>
            ))}
          </ul>
        )}

        {hasNextPage && (
          <div className="border-t border-border/60 p-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Carregando
                </>
              ) : (
                "Carregar mais"
              )}
            </Button>
          </div>
        )}
      </SettingsPanel>
    </div>
  );
}
