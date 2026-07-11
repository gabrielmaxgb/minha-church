"use client";

import { useMemo } from "react";
import { History, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/lib/api/queries/use-audit-logs";
import type { AuditLogEntry } from "@/types/audit-logs";

import {
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";

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
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatActionLabel(action: string) {
  switch (action) {
    case "church_role.created":
      return "Cargo criado";
    case "church_role.updated":
      return "Cargo alterado";
    case "church_role.deleted":
      return "Cargo excluído";
    case "membership.updated":
      return "Acesso de usuário";
    default:
      return action;
  }
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
    | undefined;

  return (
    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
      {roles?.before && roles?.after && (
        <p>
          Cargos: {roles.before.join(", ") || "—"} →{" "}
          {roles.after.join(", ") || "—"}
        </p>
      )}
      {permissions?.added && permissions.added.length > 0 && (
        <p>+ {permissions.added.join(", ")}</p>
      )}
      {permissions?.removed && permissions.removed.length > 0 && (
        <p>− {permissions.removed.join(", ")}</p>
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
            ? `Histórico de mudanças em cargos e acessos. Retenção: ${retentionDays} dias.`
            : "Histórico de mudanças em cargos e acessos."
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
