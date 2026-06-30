"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { MemberForm } from "@/components/dashboard/members/member-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useDeleteMember,
  useReceiveMember,
  useUpdateMember,
} from "@/lib/api/queries";
import {
  formValuesToUpdatePayload,
  memberToFormValues,
} from "@/lib/members/form";
import { formatDate } from "@/lib/utils";
import type { Member } from "@/types/members";
import { MEMBER_STATUS_LABELS } from "@/types/members";

interface MemberExpandedPanelProps {
  member: Member;
  canManage: boolean;
}

function ReadOnlyDetails({ member }: { member: Member }) {
  const address = [
    member.street,
    member.number,
    member.complement,
    member.neighborhood,
    member.city,
    member.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">E-mail</dt>
          <dd className="mt-0.5 text-sm">{member.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Telefone</dt>
          <dd className="mt-0.5 text-sm">{member.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Nascimento</dt>
          <dd className="mt-0.5 text-sm">{formatDate(member.birthDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Endereço</dt>
          <dd className="mt-0.5 text-sm">{address || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Batismo</dt>
          <dd className="mt-0.5 text-sm">{formatDate(member.baptismDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Status</dt>
          <dd className="mt-0.5 text-sm">{MEMBER_STATUS_LABELS[member.status]}</dd>
        </div>
      </dl>

      {member.ministries.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground">Ministérios</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {member.ministries.map((link) => (
              <li
                key={link.id}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs"
              >
                {link.ministryName}
                {link.ministryRoleName ? ` · ${link.ministryRoleName}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function MemberExpandedPanel({
  member,
  canManage,
}: MemberExpandedPanelProps) {
  const [values, setValues] = useState(() => memberToFormValues(member));
  const [error, setError] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const updateMember = useUpdateMember(member.id);
  const deleteMember = useDeleteMember(member.id);
  const receiveMember = useReceiveMember();

  useEffect(() => {
    setValues(memberToFormValues(member));
    setConfirmName("");
    setError(null);
  }, [member]);

  const canDelete = confirmName.trim() === member.name;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("Informe o nome da pessoa.");
      return;
    }

    try {
      await updateMember.mutateAsync(formValuesToUpdatePayload(values));
      setIsEditing(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar as alterações.",
      );
    }
  }

  async function handleDelete() {
    if (!canDelete) {
      return;
    }

    try {
      await deleteMember.mutateAsync();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível excluir o cadastro.",
      );
    }
  }

  if (!canManage) {
    return <ReadOnlyDetails member={member} />;
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <ReadOnlyDetails member={member} />

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => setIsEditing(true)}>
            Editar cadastro
          </Button>

          {member.status === "visitor" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={receiveMember.isPending}
              onClick={() => receiveMember.mutate(member.id)}
            >
              {receiveMember.isPending ? "Recebendo..." : "Receber como membro"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-border bg-muted/60 px-3 py-2.5 text-sm"
        >
          {error}
        </div>
      )}

      <MemberForm
        values={values}
        onChange={setValues}
        disabled={updateMember.isPending || deleteMember.isPending}
      />

      {member.ministries.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Ministérios</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {member.ministries.map((link) => (
              <li
                key={link.id}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs"
              >
                {link.ministryName}
                {link.ministryRoleName ? ` · ${link.ministryRoleName}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={updateMember.isPending || !values.name.trim()}
        >
          {updateMember.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={updateMember.isPending}
          onClick={() => {
            setValues(memberToFormValues(member));
            setIsEditing(false);
            setError(null);
          }}
        >
          Cancelar
        </Button>

        {member.status === "visitor" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={receiveMember.isPending || updateMember.isPending}
            onClick={() => receiveMember.mutate(member.id)}
          >
            Receber como membro
          </Button>
        )}
      </div>

      <Separator />

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-destructive">Excluir cadastro</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Remove o registro da pessoa. Digite{" "}
          <span className="font-medium text-foreground">{member.name}</span> para
          confirmar.
        </p>

        <div className="mt-4 space-y-3">
          <Input
            value={confirmName}
            onChange={(event) => setConfirmName(event.target.value)}
            placeholder={member.name}
            disabled={deleteMember.isPending}
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={!canDelete || deleteMember.isPending}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
            {deleteMember.isPending ? "Excluindo..." : "Excluir cadastro"}
          </Button>
        </div>
      </div>
    </form>
  );
}
