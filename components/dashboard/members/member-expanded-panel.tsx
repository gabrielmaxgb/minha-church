"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Church,
  IdCard,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserCheck,
  UserRound,
} from "lucide-react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { TierCrossingModal } from "@/components/billing/tier-crossing-modal";
import { MemberAccountCreatedModal } from "@/components/dashboard/members/member-account-created-modal";
import { MemberForm } from "@/components/dashboard/members/member-form";
import { MemberMinistriesFunctionsSection } from "@/components/dashboard/members/member-ministries-functions-section";
import { MemberMinistriesSection } from "@/components/dashboard/members/member-ministries-section";
import { MemberMinistryTagsSummary } from "@/components/dashboard/ministries/ministry-member-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  useDeleteMember,
  useReceiveMember,
  useUpdateMember,
} from "@/lib/api/queries";
import {
  countsTowardBillingTier,
  useTierCrossingGate,
} from "@/lib/billing/use-tier-crossing-gate";
import {
  formValuesToUpdatePayload,
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  memberToFormValues,
  type MemberFormValues,
} from "@/lib/members/form";
import { applyMemberFormApiError } from "@/lib/members/form-api-errors";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import { createMemberFormSchema } from "@/lib/validation/schemas";
import { cn, formatDate } from "@/lib/utils";
import type { Member, MemberAccountCredentials } from "@/types/members";
import { MEMBER_STATUS_LABELS } from "@/types/members";
import { useAuth } from "@/providers/auth-provider";

interface MemberExpandedPanelProps {
  member: Member;
  canManage: boolean;
  onDeleted?: () => void;
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center gap-2.5 border-b border-border bg-muted/20 px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted text-foreground">
          <Icon className="size-3.5" aria-hidden />
        </div>
        <h3 className="text-sm font-medium tracking-tight">{title}</h3>
      </header>
      <dl className="grid gap-4 p-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
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
    member.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
      <DetailSection icon={UserRound} title="Identificação">
        <DetailItem label="Nome" value={member.name} className="sm:col-span-2" />
        <DetailItem
          label="Status"
          value={
            <Badge variant="secondary">
              {MEMBER_STATUS_LABELS[member.status]}
            </Badge>
          }
        />
      </DetailSection>

      <DetailSection icon={Phone} title="Contato">
        <DetailItem label="E-mail" value={member.email} />
        <DetailItem label="CPF" value={member.cpf} />
        <DetailItem label="Telefone" value={member.phone} />
        <DetailItem label="Telefone secundário" value={member.phoneSecondary} />
      </DetailSection>

      <DetailSection icon={IdCard} title="Dados pessoais">
        <DetailItem label="Nascimento" value={formatDate(member.birthDate)} />
        <DetailItem
          label="Gênero"
          value={member.gender ? GENDER_LABELS[member.gender] : null}
        />
        <DetailItem
          label="Estado civil"
          value={
            member.maritalStatus
              ? MARITAL_STATUS_LABELS[member.maritalStatus]
              : null
          }
        />
        {member.maritalStatus === "married" && (
          <DetailItem
            label="Aniversário de casamento"
            value={formatDate(member.weddingAnniversary)}
          />
        )}
      </DetailSection>

      <DetailSection icon={MapPin} title="Endereço">
        <DetailItem label="Endereço completo" value={address} className="sm:col-span-2" />
      </DetailSection>

      <DetailSection icon={Church} title="Vida na igreja">
        <DetailItem
          label="Visitante desde"
          value={formatDate(member.visitorSince)}
        />
        <DetailItem
          label="Membro desde"
          value={formatDate(member.membershipDate)}
        />
        <DetailItem label="Batismo" value={formatDate(member.baptismDate)} />
      </DetailSection>

      {showMinistries && member.ministries.length > 0 && (
        <DetailSection icon={UserCheck} title="Ministérios">
          <div className="sm:col-span-2">
            <ul className="space-y-2">
              {member.ministries.map((link) => (
                <li
                  key={link.id}
                  className="rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                >
                  <span className="text-sm font-medium">{link.ministryName}</span>
                  <MemberMinistryTagsSummary
                    className="mt-2"
                    roles={link.roles}
                    instruments={link.instruments}
                  />
                </li>
              ))}
            </ul>
          </div>
        </DetailSection>
      )}
    </div>
  );
}

export function MemberExpandedPanel({
  member,
  canManage,
  onDeleted,
}: MemberExpandedPanelProps) {
  const { user, church } = useAuth();
  const { writesBlocked, reason } = useTrialWriteGuard();
  const tierCrossing = useTierCrossingGate();
  const [viewTab, setViewTab] = useState<"profile" | "ministries">("profile");
  const [confirmName, setConfirmName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{
    memberName: string;
    account: MemberAccountCredentials;
  } | null>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(createMemberFormSchema()),
    defaultValues: memberToFormValues(member),
    mode: "onBlur",
  });

  const editStatus = useWatch({ control: form.control, name: "status" }) ?? member.status;
  const canReceiveAsMember =
    member.status === "visitor" && Boolean(member.email || member.cpf);

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
  const isPending = updateMember.isPending || deleteMember.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const becomingBillable =
        !countsTowardBillingTier(member.status) &&
        countsTowardBillingTier(values.status);

      const runUpdate = async () => {
        const result = await updateMember.mutateAsync(
          formValuesToUpdatePayload(values),
        );
        setIsEditing(false);
        form.clearErrors("root");

        if (result.account) {
          setCreatedAccount({
            memberName: result.name,
            account: result.account,
          });
        }
      };

      if (becomingBillable) {
        await tierCrossing.runWithTierCrossingCheck(values.status, runUpdate, {
          projectedMemberCount: (church?.memberCount ?? 0) + 1,
        });
      } else {
        await runUpdate();
      }
    } catch (submitError) {
      applyMemberFormApiError(
        form.setError,
        form.clearErrors,
        submitError,
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar as alterações.",
      );
    }
  });

  async function handleReceiveMember() {
    try {
      await tierCrossing.runWithTierCrossingCheck(
        "active",
        async () => {
          const result = await receiveMember.mutateAsync(member.id);

          if (result.account) {
            setCreatedAccount({
              memberName: result.name,
              account: result.account,
            });
          }
        },
        {
          projectedMemberCount: (church?.memberCount ?? 0) + 1,
        },
      );
    } catch {
      // mutation / preview error surfaces via form or react-query if needed
    }
  }

  async function handleDelete() {
    if (!canDelete) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMember.mutateAsync();
      onDeleted?.();
    } catch (submitError) {
      setDeleteError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível excluir o cadastro.",
      );
    }
  }

  if (!canManage) {
    const isSelf = user?.id === member.userId;

    return (
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-border/60 pb-2">
          <button
            type="button"
            onClick={() => setViewTab("profile")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              viewTab === "profile"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Perfil
          </button>
          <button
            type="button"
            onClick={() => setViewTab("ministries")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              viewTab === "ministries"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Ministérios
          </button>
        </div>

        {viewTab === "profile" ? (
          <ReadOnlyDetails member={member} showMinistries={false} />
        ) : (
          <MemberMinistriesFunctionsSection
            memberId={member.id}
            ministries={member.ministries}
            editable={isSelf && !writesBlocked}
          />
        )}
      </div>
    );
  }

  if (!isEditing) {
    return (
      <>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setIsEditing(true)}>
              <Pencil className="size-4" />
              Editar cadastro
            </Button>

            {member.status === "visitor" && (
              <Button
                type="button"
                variant="outline"
                disabled={
                  writesBlocked ||
                  receiveMember.isPending ||
                  !canReceiveAsMember
                }
                title={writesBlocked ? reason ?? undefined : undefined}
                onClick={() => void handleReceiveMember()}
              >
                {receiveMember.isPending ? "Recebendo..." : "Receber como membro"}
              </Button>
            )}
          </div>

          {member.status === "visitor" && !canReceiveAsMember && (
            <p className="text-sm text-muted-foreground">
              Cadastre e-mail ou CPF antes de receber como membro e liberar o
              acesso ao painel.
            </p>
          )}

          <ReadOnlyDetails member={member} showMinistries={false} />

          <div className="space-y-3">
            <div className="flex gap-2 border-b border-border/60 pb-2">
              <button
                type="button"
                onClick={() => setViewTab("ministries")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  viewTab === "ministries"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Funções nos ministérios
              </button>
            </div>
            <MemberMinistriesFunctionsSection
              memberId={member.id}
              ministries={member.ministries}
              editable={!writesBlocked}
            />
          </div>

          <MemberMinistriesSection member={member} disabled={writesBlocked} />
        </div>

        {createdAccount && (
          <MemberAccountCreatedModal
            open
            memberName={createdAccount.memberName}
            account={createdAccount.account}
            onClose={() => setCreatedAccount(null)}
          />
        )}

        {tierCrossing.preview && (
          <TierCrossingModal
            open
            preview={tierCrossing.preview}
            mode={tierCrossing.mode}
            loading={tierCrossing.loading}
            error={tierCrossing.error}
            requestSent={tierCrossing.requestSent}
            onConfirm={() => void tierCrossing.confirm()}
            onRequestOwner={() => void tierCrossing.requestOwnerApproval()}
            onClose={tierCrossing.close}
          />
        )}
      </>
    );
  }

  return (
    <>
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 sm:px-5">
          <p className="text-sm font-medium text-foreground">
            Editando cadastro
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Altere as seções abaixo e salve quando terminar. Campos opcionais
            podem ficar em branco.
          </p>
        </div>

        {form.formState.errors.root?.message && (
          <FormAlert>{form.formState.errors.root.message}</FormAlert>
        )}

        <MemberForm
          disabled={isPending}
          requireLogin={editStatus === "active" && !member.userId}
        />

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <header className="flex items-center gap-3 border-b border-border bg-muted/25 px-5 py-4 sm:px-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
              <UserCheck className="size-4" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-medium tracking-tight">Ministérios</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Vínculos e cargos desta pessoa nos ministérios da igreja.
              </p>
            </div>
          </header>
          <div className="p-5 sm:p-6">
            <MemberMinistriesSection
              member={member}
              disabled={isPending || writesBlocked}
              hideTitle
            />
          </div>
        </section>

        <div
          className={cn(
            "sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-2 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            As alterações só são aplicadas ao salvar.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                form.reset(memberToFormValues(member));
                setIsEditing(false);
                form.clearErrors("root");
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMember.isPending}>
              {updateMember.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </div>

        {member.status === "visitor" && (
          <div className="rounded-lg border border-border bg-muted/15 px-5 py-4">
            <p className="text-sm font-medium">Receber como membro</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Promove para membro ativo e cria o acesso ao painel com senha
              temporária.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              disabled={
                writesBlocked ||
                receiveMember.isPending ||
                isPending ||
                !canReceiveAsMember
              }
              title={writesBlocked ? reason ?? undefined : undefined}
              onClick={() => void handleReceiveMember()}
            >
              {receiveMember.isPending ? "Recebendo..." : "Receber como membro"}
            </Button>
          </div>
        )}

        {deleteError && <FormAlert>{deleteError}</FormAlert>}

        {!writesBlocked && (
        <section className="rounded-lg border border-destructive/20 bg-destructive/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Trash2 className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Zona de perigo
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Excluir remove o cadastro pastoral de{" "}
                <span className="font-medium text-foreground">{member.name}</span>.
                Digite o nome completo para confirmar.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  value={confirmName}
                  onChange={(event) => setConfirmName(event.target.value)}
                  placeholder={member.name}
                  disabled={deleteMember.isPending}
                  className="sm:max-w-xs"
                />
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!canDelete || deleteMember.isPending}
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" />
                  {deleteMember.isPending ? "Excluindo..." : "Excluir cadastro"}
                </Button>
              </div>
            </div>
          </div>
        </section>
        )}
      </form>
    </FormProvider>

      {createdAccount && (
        <MemberAccountCreatedModal
          open
          memberName={createdAccount.memberName}
          account={createdAccount.account}
          onClose={() => setCreatedAccount(null)}
        />
      )}

      {tierCrossing.preview && (
        <TierCrossingModal
          open
          preview={tierCrossing.preview}
          mode={tierCrossing.mode}
          loading={tierCrossing.loading}
          error={tierCrossing.error}
          requestSent={tierCrossing.requestSent}
          onConfirm={() => void tierCrossing.confirm()}
          onRequestOwner={() => void tierCrossing.requestOwnerApproval()}
          onClose={tierCrossing.close}
        />
      )}
    </>
  );
}
