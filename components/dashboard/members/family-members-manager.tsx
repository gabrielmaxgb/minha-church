"use client";

import { useMemo, useState } from "react";
import { Loader2, UserMinus, UserPlus, Users } from "lucide-react";

import { BusyOverlay } from "@/components/ui/busy-overlay";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TypeaheadMultiSelect } from "@/components/ui/typeahead-multi-select";
import { useMembers, useSetMemberFamily } from "@/lib/api/queries";
import type { FamilyGraphMember } from "@/types/members";

interface FamilyMembersManagerProps {
  familyId: string;
  familyName: string;
  members: FamilyGraphMember[];
  canEdit: boolean;
}

export function FamilyMembersManager({
  familyId,
  familyName,
  members,
  canEdit,
}: FamilyMembersManagerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: membersData, isLoading } = useMembers(
    { limit: 200 },
    { enabled: canEdit },
  );
  const setFamily = useSetMemberFamily(familyId);

  const inFamilyIds = useMemo(
    () => new Set(members.map((member) => member.id)),
    [members],
  );

  const availableOptions = useMemo(() => {
    const list = membersData?.data ?? [];
    return list
      .filter((member) => !inFamilyIds.has(member.id))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      .map((member) => ({
        value: member.id,
        label: member.name,
        description:
          member.family?.name
            ? `Hoje em: ${member.family.name}`
            : (member.email ?? member.phone ?? undefined),
        searchText: [member.email, member.phone, member.cpf, member.family?.name]
          .filter(Boolean)
          .join(" "),
      }));
  }, [membersData, inFamilyIds]);

  const busy = setFamily.isPending;
  const isAdding = busy && removingId === null;
  const addCount = selectedIds.length;

  async function handleAdd() {
    if (selectedIds.length === 0) {
      setError("Selecione ao menos uma pessoa.");
      return;
    }

    setError(null);
    const pendingIds = [...selectedIds];

    try {
      const result = await setFamily.mutateAsync({
        memberIds: pendingIds,
        familyId,
      });

      if (result.failedCount > 0) {
        const succeeded = new Set(result.succeededIds);
        setSelectedIds(pendingIds.filter((id) => !succeeded.has(id)));
        setError(
          result.firstError
            ? `${result.succeededIds.length} adicionados. ${result.failedCount} falharam: ${result.firstError}`
            : `${result.succeededIds.length} adicionados. ${result.failedCount} não puderam ser vinculados.`,
        );
        return;
      }

      setSelectedIds([]);
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Não foi possível adicionar à família.",
      );
    }
  }

  async function handleRemove(memberId: string) {
    setError(null);
    setRemovingId(memberId);

    try {
      await setFamily.mutateAsync({ memberId, familyId: null });
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Não foi possível remover da família.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card px-4 py-4 sm:px-5">
      <BusyOverlay
        active={isAdding}
        icon={Users}
        steps={
          addCount > 1
            ? ([
                `Vinculando ${addCount} pessoas...`,
                "Atualizando o grafo...",
              ] as const)
            : (["Vinculando à família...", "Atualizando o grafo..."] as const)
        }
      />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Pessoas nesta família
          </p>
          <p className="text-xs text-muted-foreground">
            Adicione ou remova quem faz parte de {familyName}.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {members.length} pessoa{members.length === 1 ? "" : "s"}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {members.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground">
            Ninguém vinculado ainda. Adicione pessoas abaixo.
          </li>
        ) : (
          members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
            >
              <span className="min-w-0 truncate text-sm font-medium text-foreground">
                {member.name}
              </span>
              {canEdit ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={busy}
                  onClick={() => void handleRemove(member.id)}
                >
                  {removingId === member.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <UserMinus className="size-3.5" />
                  )}
                  Remover
                </Button>
              ) : null}
            </li>
          ))
        )}
      </ul>

      {canEdit ? (
        <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
          <Label>Adicionar pessoas</Label>
          <TypeaheadMultiSelect
            value={selectedIds}
            onChange={setSelectedIds}
            options={availableOptions}
            placeholder={
              isLoading ? "Carregando membros..." : "Buscar membro..."
            }
            emptyMessage={
              isLoading
                ? "Carregando..."
                : availableOptions.length === 0
                  ? "Não há outros membros para adicionar."
                  : "Nenhum membro encontrado."
            }
            disabled={busy || isLoading}
          />
          <Button
            type="button"
            size="sm"
            disabled={busy || selectedIds.length === 0}
            onClick={() => void handleAdd()}
          >
            {isAdding ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <UserPlus className="size-3.5" />
            )}
            {addCount > 1
              ? `Adicionar ${addCount} à família`
              : "Adicionar à família"}
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
