"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Ban,
  Church,
  IdCard,
  MapPin,
  Network,
  Pencil,
  Phone,
  Trash2,
  UserCheck,
  UserPlus,
  UserRound,
} from "lucide-react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { TierCrossingModal } from "@/components/billing/tier-crossing-modal";
import { FinanceConfirmDialog } from "@/components/dashboard/finances/finance-confirm-dialog";
import { LinkMemberFamilyModal } from "@/components/dashboard/members/link-member-family-modal";
import { MemberAccountCreatedModal } from "@/components/dashboard/members/member-account-created-modal";
import { MemberForm } from "@/components/dashboard/members/member-form";
import { ParentalConsentModal } from "@/components/dashboard/members/parental-consent-modal";
import { MemberMinistriesFunctionsSection } from "@/components/dashboard/members/member-ministries-functions-section";
import { MemberMinistriesSection } from "@/components/dashboard/members/member-ministries-section";
import { MemberMinistryTagsSummary } from "@/components/dashboard/ministries/ministry-member-tags";
import { Badge } from "@/components/ui/badge";
import { BusyOverlay } from "@/components/ui/busy-overlay";
import { Button } from "@/components/ui/button";
import { FloatingSaveBar } from "@/components/ui/floating-save-bar";
import { FormAlert } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { familyGraphPath } from "@/constants/routes";
import {
  useDeleteMember,
  useReceiveMember,
  useRevokeParentalConsent,
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
import {
  isMinorMember,
  needsParentalConsentBeforeReceive,
} from "@/lib/members/parental-consent";
import { useTrialWriteGuard } from "@/lib/subscription/use-trial-write-guard";
import { createMemberFormSchema } from "@/lib/validation/schemas";
import { cn, formatDate } from "@/lib/utils";
import type { Member, MemberAccountCredentials } from "@/types/members";
import { MEMBER_STATUS_LABELS } from "@/types/members";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api/client";

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
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {MEMBER_STATUS_LABELS[member.status]}
              </Badge>
              {isMinorMember(member) ? (
                <Badge
                  variant="outline"
                  className={
                    member.parentalConsentGranted
                      ? "border-emerald-600/30 text-emerald-700"
                      : "border-amber-600/30 text-amber-700"
                  }
                >
                  {member.parentalConsentGranted
                    ? "Menor · consentimento ok"
                    : "Menor · consentimento pendente"}
                </Badge>
              ) : null}
            </div>
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
  const [familyLinkOpen, setFamilyLinkOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<MemberFormValues | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{
    memberName: string;
    account: MemberAccountCredentials;
  } | null>(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [receiveAfterConsent, setReceiveAfterConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(createMemberFormSchema()),
    defaultValues: memberToFormValues(member),
    mode: "onBlur",
  });

  const editStatus = useWatch({ control: form.control, name: "status" }) ?? member.status;
  const canReceiveAsMember =
    member.status === "visitor" && Boolean(member.email || member.cpf);
  const needsConsent = needsParentalConsentBeforeReceive(member);
  const isMinor = isMinorMember(member);
  const openMonthlyCount = member.activeGivingSubscriptionsCount ?? 0;

  const updateMember = useUpdateMember(member.id);
  const deleteMember = useDeleteMember(member.id);
  const receiveMember = useReceiveMember();
  const revokeConsent = useRevokeParentalConsent(member.id);

  useEffect(() => {
    form.reset(memberToFormValues(member));
    setConfirmName("");
    setDeleteError(null);
    setPendingStatusChange(null);
    form.clearErrors("root");
  }, [member, form]);

  const canDelete = confirmName.trim() === member.name;
  const isPending = updateMember.isPending || deleteMember.isPending;
  const mutationBusy = updateMember.isPending || receiveMember.isPending;
  const creatingLogin =
    receiveMember.isPending ||
    (updateMember.isPending && editStatus === "active" && !member.userId);
  const busySteps = receiveMember.isPending
    ? ([
        "Recebendo o visitante...",
        "Criando o acesso ao painel...",
        "Gerando as credenciais de login...",
      ] as const)
    : creatingLogin
      ? ([
          "Salvando as alterações...",
          "Liberando o acesso ao painel...",
          "Gerando as credenciais de login...",
        ] as const)
      : (["Salvando as alterações..."] as const);

  async function runMemberUpdate(values: MemberFormValues) {
    const becomingBillable =
      !countsTowardBillingTier(member.status) &&
      countsTowardBillingTier(values.status);

    const runUpdate = async () => {
      const result = await updateMember.mutateAsync(
        formValuesToUpdatePayload(values),
      );
      setIsEditing(false);
      setPendingStatusChange(null);
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
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const leavingActive =
        member.status === "active" && values.status !== "active";

      if (leavingActive) {
        setPendingStatusChange(values);
        return;
      }

      await runMemberUpdate(values);
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

  async function runReceiveMember() {
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
  }

  async function handleReceiveMember() {
    setConsentError(null);

    if (needsConsent) {
      setReceiveAfterConsent(true);
      setConsentModalOpen(true);
      return;
    }

    try {
      await runReceiveMember();
    } catch (error) {
      setConsentError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Não foi possível receber o membro.",
      );
    }
  }

  async function handleConsentRecorded() {
    setConsentError(null);
    if (!receiveAfterConsent) {
      return;
    }

    setReceiveAfterConsent(false);
    try {
      await runReceiveMember();
    } catch (error) {
      setConsentError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Consentimento registrado, mas não foi possível receber o membro.",
      );
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
        <div className="relative space-y-5">
          <BusyOverlay
            active={mutationBusy}
            icon={UserPlus}
            steps={busySteps}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setIsEditing(true)}>
              <Pencil className="size-4" />
              Editar cadastro
            </Button>

            {member.familyId ? (
              <Button type="button" variant="outline" asChild>
                <Link href={familyGraphPath(member.familyId)}>
                  <Network className="size-4" />
                  Ver grafo da família
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setFamilyLinkOpen(true)}
              >
                <Network className="size-4" />
                Ver grafo da família
              </Button>
            )}

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
                {receiveMember.isPending
                  ? "Recebendo..."
                  : needsConsent
                    ? "Consentir e receber"
                    : "Receber como membro"}
              </Button>
            )}

            {isMinor && needsConsent ? (
              <Button
                type="button"
                variant="outline"
                disabled={writesBlocked || revokeConsent.isPending}
                onClick={() => {
                  setReceiveAfterConsent(false);
                  setConsentModalOpen(true);
                }}
              >
                Registrar consentimento
              </Button>
            ) : null}

            {isMinor && member.parentalConsentGranted ? (
              <Button
                type="button"
                variant="ghost"
                disabled={writesBlocked || revokeConsent.isPending}
                onClick={() => {
                  setConsentError(null);
                  void revokeConsent.mutateAsync().catch((error: unknown) => {
                    setConsentError(
                      error instanceof ApiError
                        ? error.message
                        : error instanceof Error
                          ? error.message
                          : "Não foi possível revogar o consentimento.",
                    );
                  });
                }}
              >
                {revokeConsent.isPending
                  ? "Revogando..."
                  : "Revogar consentimento"}
              </Button>
            ) : null}
          </div>

          {member.status === "visitor" && !canReceiveAsMember && (
            <p className="text-sm text-muted-foreground">
              Cadastre e-mail ou CPF antes de receber como membro e liberar o
              acesso ao painel.
            </p>
          )}

          {needsConsent ? (
            <p className="text-sm text-muted-foreground">
              Menor de idade: a ficha pastoral pode ser usada normalmente. Para
              liberar login no painel, registre o consentimento parental.
            </p>
          ) : null}

          {consentError ? <FormAlert>{consentError}</FormAlert> : null}

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

        <LinkMemberFamilyModal
          memberId={member.id}
          memberName={member.name}
          open={familyLinkOpen}
          onClose={() => setFamilyLinkOpen(false)}
        />

        <ParentalConsentModal
          member={member}
          open={consentModalOpen}
          onClose={() => {
            setConsentModalOpen(false);
            setReceiveAfterConsent(false);
          }}
          onRecorded={() => {
            void handleConsentRecorded();
          }}
        />

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
    <div className="relative">
      <BusyOverlay
        active={mutationBusy}
        icon={UserPlus}
        steps={busySteps}
      />
    <FormProvider {...form}>
      <form
        id="member-edit-form"
        onSubmit={onSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Editando cadastro
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Altere as seções abaixo e salve quando terminar. Campos opcionais
              podem ficar em branco.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={isPending}
            onClick={() => {
              form.reset(memberToFormValues(member));
              setIsEditing(false);
              form.clearErrors("root");
            }}
          >
            Cancelar
          </Button>
        </div>

        {form.formState.errors.root?.message && (
          <FormAlert>{form.formState.errors.root.message}</FormAlert>
        )}

        <MemberForm
          disabled={isPending}
          requireLogin={editStatus === "active" && !member.userId}
          blockActivePromotion={writesBlocked && member.status !== "active"}
        />

        {member.status === "active" && editStatus !== "active" ? (
          <div
            role="status"
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-950"
          >
            <p className="font-medium">
              Contribuições mensais serão canceladas ao salvar
            </p>
            <p className="mt-1 text-amber-900/90">
              {openMonthlyCount > 0
                ? `Há ${openMonthlyCount} ${
                    openMonthlyCount === 1
                      ? "contribuição mensal ativa"
                      : "contribuições mensais ativas"
                  } neste cadastro.`
                : "Mesmo que não haja cobrança recorrente agora, confirmamos esse efeito para evitar surpresas."}{" "}
              Ao salvar, pediremos confirmação e qualquer contribuição mensal
              vinculada será encerrada. Valores já confirmados permanecem no
              histórico.
            </p>
          </div>
        ) : null}

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

        {member.status === "visitor" && (
          <div className="rounded-lg border border-border bg-muted/15 px-5 py-4">
            <p className="text-sm font-medium">Receber como membro</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {needsConsent
                ? "Menor de idade: registre o consentimento parental e então libere o acesso ao painel."
                : "Promove para membro ativo e cria o acesso ao painel com senha temporária."}
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
              {receiveMember.isPending
                ? "Recebendo..."
                : needsConsent
                  ? "Consentir e receber"
                  : "Receber como membro"}
            </Button>
          </div>
        )}

        {consentError ? <FormAlert>{consentError}</FormAlert> : null}

        <ParentalConsentModal
          member={member}
          open={consentModalOpen}
          onClose={() => {
            setConsentModalOpen(false);
            setReceiveAfterConsent(false);
          }}
          onRecorded={() => {
            void handleConsentRecorded();
          }}
        />

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

              <div
                role="alert"
                className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-sm leading-relaxed text-amber-950"
              >
                <p className="font-medium">
                  Contribuições mensais serão canceladas
                </p>
                <p className="mt-1 text-amber-900/90">
                  {openMonthlyCount > 0
                    ? `Há ${openMonthlyCount} ${
                        openMonthlyCount === 1
                          ? "contribuição mensal ativa"
                          : "contribuições mensais ativas"
                      }. `
                    : "Mesmo sem cobrança recorrente agora, "}
                  ao excluir, qualquer contribuição mensal vinculada terá as
                  cobranças futuras no cartão encerradas. Valores já confirmados
                  permanecem no histórico financeiro.
                </p>
              </div>

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
                  {deleteMember.isPending
                    ? "Excluindo..."
                    : "Excluir e cancelar mensais"}
                </Button>
              </div>
            </div>
          </div>
        </section>
        )}
      </form>

      <FloatingSaveBar
        visible={form.formState.isDirty}
        saving={updateMember.isPending}
        onDiscard={() => {
          form.reset(memberToFormValues(member));
          form.clearErrors("root");
        }}
        onSave={() => {
          const formEl = document.getElementById(
            "member-edit-form",
          ) as HTMLFormElement | null;
          formEl?.requestSubmit();
        }}
      />
    </FormProvider>
    </div>

      {createdAccount && (
        <MemberAccountCreatedModal
          open
          memberName={createdAccount.memberName}
          account={createdAccount.account}
          onClose={() => setCreatedAccount(null)}
        />
      )}

      {pendingStatusChange ? (
        <FinanceConfirmDialog
          title="Cancelar contribuições mensais?"
          tone="warning"
          icon={Ban}
          description={
            <div className="space-y-3">
              <p>
                Ao mudar a situação de membro ativo para{" "}
                <span className="font-medium text-foreground">
                  {MEMBER_STATUS_LABELS[pendingStatusChange.status].toLowerCase()}
                </span>
                , contribuições mensais vinculadas a este cadastro serão
                encerradas automaticamente.
              </p>
              <div
                role="alert"
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-950"
              >
                <p className="font-medium">
                  {openMonthlyCount > 0
                    ? `${openMonthlyCount} ${
                        openMonthlyCount === 1
                          ? "contribuição mensal ativa será cancelada"
                          : "contribuições mensais ativas serão canceladas"
                      }.`
                    : "Não há contribuição mensal ativa agora — mesmo assim confirmamos: se houver, será cancelada."}
                </p>
                <p className="mt-1 text-amber-900/90">
                  Cobranças futuras no cartão param. Valores já confirmados
                  continuam no histórico financeiro da igreja.
                </p>
              </div>
            </div>
          }
          confirmLabel="Salvar e cancelar mensais"
          confirmingLabel="Salvando..."
          isPending={updateMember.isPending}
          onCancel={() => {
            if (!updateMember.isPending) {
              setPendingStatusChange(null);
            }
          }}
          onConfirm={() => {
            void runMemberUpdate(pendingStatusChange).catch((submitError) => {
              setPendingStatusChange(null);
              applyMemberFormApiError(
                form.setError,
                form.clearErrors,
                submitError,
                submitError instanceof Error
                  ? submitError.message
                  : "Não foi possível salvar as alterações.",
              );
            });
          }}
        />
      ) : null}

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
