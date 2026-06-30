"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Separator } from "@/components/ui/separator";
import { useAssignMemberToMinistry, useMembers } from "@/lib/api/queries";
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
  const [search, setSearch] = useState("");
  const [memberId, setMemberId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: membersData, isLoading } = useMembers({ limit: 100 });
  const assignMember = useAssignMemberToMinistry(ministry.id);

  const assignedIds = useMemo(
    () => new Set(currentMembers.map((member) => member.memberId)),
    [currentMembers],
  );

  const availableMembers = useMemo(() => {
    const members = membersData?.data ?? [];

    return members
      .filter((member) => !assignedIds.has(member.id))
      .filter((member) => {
        if (!search.trim()) {
          return true;
        }

        const query = search.trim().toLowerCase();

        return (
          member.name.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query) ||
          member.phone?.includes(query)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [membersData, assignedIds, search]);

  const roles = [...ministry.roles].sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setMemberId("");
      setRoleId("");
      setError(null);
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
      if (event.key === "Escape" && !assignMember.isPending) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, assignMember.isPending]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!memberId) {
      setError("Selecione um membro.");
      return;
    }

    try {
      await assignMember.mutateAsync({
        memberId,
        payload: {
          ministryRoleId: roleId || undefined,
        },
      });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível adicionar o membro.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Fechar modal"
        disabled={assignMember.isPending}
        onClick={() => {
          if (!assignMember.isPending) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92dvh,640px)] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start gap-4 px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserPlus className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight">
              Adicionar membro
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vincule alguém ao ministério <span className="font-medium text-foreground">{ministry.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={assignMember.isPending}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <Separator />

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-border bg-muted/60 px-3 py-2.5 text-sm"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="member-search">Buscar membro</Label>
              <Input
                id="member-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome, e-mail ou telefone"
                disabled={assignMember.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-select">Membro</Label>
              <SelectField
                id="member-select"
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
                disabled={assignMember.isPending || isLoading}
                required
              >
                <option value="">
                  {isLoading ? "Carregando..." : "Selecione um membro"}
                </option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.email ? ` · ${member.email}` : ""}
                  </option>
                ))}
              </SelectField>
              {!isLoading && availableMembers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum membro disponível para adicionar.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-role">Cargo no ministério</Label>
              <SelectField
                id="member-role"
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
                disabled={assignMember.isPending || roles.length === 0}
              >
                <option value="">Sem cargo definido</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </SelectField>
              {roles.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Crie cargos na aba &quot;Cargos&quot; antes de atribuir papéis.
                </p>
              )}
            </div>
          </div>

          <Separator />

          <footer className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={assignMember.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={assignMember.isPending || !memberId}
              className="w-full sm:w-auto"
            >
              {assignMember.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar ao ministério"
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
