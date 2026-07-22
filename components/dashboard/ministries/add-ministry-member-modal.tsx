"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BusyOverlay } from "@/components/ui/busy-overlay";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TypeaheadMultiSelect } from "@/components/ui/typeahead-multi-select";
import {
  useAssignMembersToMinistry,
  useMembers,
} from "@/lib/api/queries";
import { toastApiError, toastError } from "@/lib/ui/toast";
import { canManageMinistryTeam } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import type { Ministry, MinistryMember } from "@/types/ministries";

interface AddMinistryMemberModalProps {
  ministry: Ministry;
  currentMembers: MinistryMember[];
  open: boolean;
  onClose: () => void;
}

export function AddMinistryMemberModal({
  ministry,
  currentMembers,
  open,
  onClose,
}: AddMinistryMemberModalProps) {
  const titleId = useId();
  const { permissions } = useAuth();
  const canManage = permissions
    ? canManageMinistryTeam(permissions, ministry.id)
    : false;
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const { data: membersData, isLoading } = useMembers(
    { limit: 200 },
    { enabled: open && canManage },
  );
  const assignMembers = useAssignMembersToMinistry(ministry.id);

  const assignedIds = useMemo(
    () => new Set(currentMembers.map((member) => member.memberId)),
    [currentMembers],
  );

  const availableMembers = useMemo(() => {
    const members = membersData?.data ?? [];

    return members
      .filter((member) => !assignedIds.has(member.id))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [membersData, assignedIds]);

  const memberOptions = useMemo(
    () =>
      availableMembers.map((member) => ({
        value: member.id,
        label: member.name,
        description: member.email ?? member.phone ?? undefined,
        searchText: [member.email, member.phone, member.cpf]
          .filter(Boolean)
          .join(" "),
      })),
    [availableMembers],
  );

  const memberCount = memberIds.length;
  const hasRemainingMembers = memberOptions.some(
    (option) => !memberIds.includes(option.value),
  );
  const membersEmptyMessage = isLoading
    ? "Carregando membros..."
    : memberOptions.length === 0
      ? "Nenhum membro disponível para adicionar."
      : !hasRemainingMembers
        ? "Todos os membros disponíveis já foram selecionados."
        : "Nenhum membro encontrado.";
  const submitLabel =
    memberCount === 0
      ? "Adicionar ao ministério"
      : memberCount === 1
        ? "Adicionar 1 membro"
        : `Adicionar ${memberCount} membros`;

  useEffect(() => {
    if (!open) {
      setMemberIds([]);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !assignMembers.isPending) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, assignMembers.isPending]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (memberIds.length === 0) {
      toastError("Selecione ao menos um membro.");
      return;
    }

    try {
      const { succeeded, failed } = await assignMembers.mutateAsync({
        memberIds,
        payload: {
          ministryRoleIds: [],
        },
      });

      if (failed.length === 0) {
        onClose();
        return;
      }

      setMemberIds(failed);

      if (succeeded.length > 0) {
        toastError(
          `${succeeded.length} membro${succeeded.length === 1 ? "" : "s"} adicionado${succeeded.length === 1 ? "" : "s"}. ${failed.length} não pôde${failed.length === 1 ? "" : "ram"} ser vinculado${failed.length === 1 ? "" : "s"}.`,
        );
        return;
      }

      toastError("Não foi possível adicionar os membros selecionados.");
    } catch (submitError) {
      toastApiError(submitError, "Não foi possível adicionar os membros.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar modal"
        disabled={assignMembers.isPending}
        onClick={() => {
          if (!assignMembers.isPending) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92dvh,100%)] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl border border-border bg-background shadow-popover sm:max-h-[min(90dvh,720px)] sm:rounded-xl"
      >
        <BusyOverlay
          active={assignMembers.isPending}
          icon={UserPlus}
          steps={[
            "Vinculando membros ao ministério...",
            "Atualizando a equipe...",
          ]}
        />
        <header className="flex shrink-0 items-start gap-4 px-5 pb-4 pt-6 sm:px-8 sm:pb-5 sm:pt-8">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserPlus className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
              Adicionar membros
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Vincule uma ou mais pessoas ao ministério{" "}
              <span className="font-medium text-foreground">{ministry.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={assignMembers.isPending}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <Separator />

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="member-typeahead">Membros</Label>
                {memberCount > 0 && (
                  <Badge variant="secondary" className="font-normal tabular-nums">
                    {memberCount} selecionado{memberCount === 1 ? "" : "s"}
                  </Badge>
                )}
              </div>
              <TypeaheadMultiSelect
                id="member-typeahead"
                value={memberIds}
                onChange={setMemberIds}
                options={memberOptions}
                placeholder="Nome, e-mail ou telefone"
                listClassName="max-h-80"
                emptyMessage={membersEmptyMessage}
                loading={isLoading}
                disabled={assignMembers.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Busque e selecione várias pessoas para vincular ao ministério.
              </p>
            </div>
          </div>

          <footer className="mt-auto flex shrink-0 flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-8 sm:py-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={assignMembers.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={assignMembers.isPending || memberIds.length === 0}
              className="w-full sm:w-auto"
            >
              {assignMembers.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
