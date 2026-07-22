"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { MemberAccountCreatedModal } from "@/components/dashboard/members/member-account-created-modal";
import { MemberCreatingOverlay } from "@/components/dashboard/members/member-creating-overlay";
import { MemberForm } from "@/components/dashboard/members/member-form";
import { TierCrossingModal } from "@/components/billing/tier-crossing-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-field";
import { AUTH_ROUTES } from "@/constants/routes";
import { useCreateMember } from "@/lib/api/queries";
import {
  MEMBER_ACCESS_LOCKED_REASON,
  useFeatureLock,
} from "@/lib/subscription/use-feature-lock";
import {
  emptyMemberFormValues,
  formValuesToCreatePayload,
  type MemberFormValues,
} from "@/lib/members/form";
import { applyMemberFormApiError } from "@/lib/members/form-api-errors";
import { useTierCrossingGate } from "@/lib/billing/use-tier-crossing-gate";
import { createMemberFormSchema } from "@/lib/validation/schemas";
import type { MemberAccountCredentials } from "@/types/members";

export function CreateMemberContent() {
  const router = useRouter();
  const [createdAccount, setCreatedAccount] = useState<{
    memberName: string;
    account: MemberAccountCredentials;
  } | null>(null);
  const createMember = useCreateMember();
  const { locked: memberAccessLocked } = useFeatureLock();
  const tierCrossing = useTierCrossingGate();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(createMemberFormSchema()),
    defaultValues: emptyMemberFormValues("visitor"),
    mode: "onBlur",
  });

  const status =
    useWatch({ control: form.control, name: "status" }) ?? "visitor";

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await tierCrossing.runWithTierCrossingCheck(values.status, async () => {
        const result = await createMember.mutateAsync(
          formValuesToCreatePayload(values),
        );

        if (result.account) {
          setCreatedAccount({
            memberName: result.name,
            account: result.account,
          });
          return;
        }

        router.push(AUTH_ROUTES.members);
      });
    } catch (submitError) {
      applyMemberFormApiError(
        form.setError,
        form.clearErrors,
        submitError,
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível cadastrar o membro.",
      );
    }
  });

  function handleCloseAccountModal() {
    setCreatedAccount(null);
    router.push(AUTH_ROUTES.members);
  }

  return (
    <>
      <div className="space-y-6">
        <Link
          href={AUTH_ROUTES.members}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para membros
        </Link>

        <Card className="relative overflow-hidden">
          <MemberCreatingOverlay
            active={createMember.isPending}
            requiresLogin={status === "active"}
          />

          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <UserPlus className="size-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight">
                  Novo cadastro
                </CardTitle>
                <CardDescription className="mt-1">
                  Cadastro pastoral para todos. O login no painel só é criado
                  quando o status for membro ativo (ou ao receber um visitante).
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                {memberAccessLocked && (
                  <FormAlert>{MEMBER_ACCESS_LOCKED_REASON}</FormAlert>
                )}

                <MemberForm
                  requireLogin={status === "active"}
                  disabled={createMember.isPending}
                  blockActivePromotion={memberAccessLocked}
                />

                <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" asChild>
                    <Link href={AUTH_ROUTES.members}>Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={createMember.isPending}>
                    {createMember.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Cadastrar pessoa"
                    )}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>

      {createdAccount && (
        <MemberAccountCreatedModal
          open
          memberName={createdAccount.memberName}
          account={createdAccount.account}
          onClose={handleCloseAccountModal}
        />
      )}

      {tierCrossing.preview && (
        <TierCrossingModal
          open
          preview={tierCrossing.preview}
          mode={tierCrossing.mode}
          loading={tierCrossing.loading}
          requestSent={tierCrossing.requestSent}
          onConfirm={() => void tierCrossing.confirm()}
          onRequestOwner={() => void tierCrossing.requestOwnerApproval()}
          onClose={tierCrossing.close}
        />
      )}
    </>
  );
}
