"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { MemberForm } from "@/components/dashboard/members/member-form";
import { MemberMinistriesSection } from "@/components/dashboard/members/member-ministries-section";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
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
  type MemberFormValues,
} from "@/lib/members/form";
import { createMemberFormSchema } from "@/lib/validation/schemas";
import { formatDate } from "@/lib/utils";
import type { Member } from "@/types/members";
import { MEMBER_STATUS_LABELS } from "@/types/members";

interface MemberExpandedPanelProps {
  member: Member;
  canManage: boolean;
}

function ReadOnlyDetails({
  member,
  showMinistries = true,
}: {
  member: Member;
  showMinistries?: boolean;
}) {
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

      {showMinistries && member.ministries.length > 0 && (
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
  const [confirmName, setConfirmName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(createMemberFormSchema({ requireLogin: false })),
    defaultValues: memberToFormValues(member),
    mode: "onBlur",
  });

  const updateMember = useUpdateMember(member.id);
  const deleteMember = useDeleteMember(member.id);
  const receiveMember = useReceiveMember();

  useEffect(() => {
    form.reset(memberToFormValues(member));
    setConfirmName("");
    setDeleteError(null);
    form.clearErrors("root");
  }, [member, form]);

  const canDelete = confirmName.trim() === member.name;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMember.mutateAsync(formValuesToUpdatePayload(values));
      setIsEditing(false);
      form.clearErrors("root");
    } catch (submitError) {
      form.setError("root", {
        message:
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível salvar as alterações.",
      });
    }
  });

  async function handleDelete() {
    if (!canDelete) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMember.mutateAsync();
    } catch (submitError) {
      setDeleteError(
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
        <ReadOnlyDetails member={member} showMinistries={!canManage} />

        {canManage && <MemberMinistriesSection member={member} />}

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
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {form.formState.errors.root?.message && (
          <FormAlert>{form.formState.errors.root.message}</FormAlert>
        )}

        <MemberForm
          disabled={updateMember.isPending || deleteMember.isPending}
        />

        <MemberMinistriesSection
          member={member}
          disabled={updateMember.isPending || deleteMember.isPending}
        />

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={updateMember.isPending}
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
            form.reset(memberToFormValues(member));
            setIsEditing(false);
            form.clearErrors("root");
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

      {deleteError && <FormAlert>{deleteError}</FormAlert>}

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
    </FormProvider>
  );
}
