"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { MemberAccountCreatedModal } from "@/components/dashboard/members/member-account-created-modal";
import { MemberForm } from "@/components/dashboard/members/member-form";
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
  emptyMemberFormValues,
  formValuesToCreatePayload,
  type MemberFormValues,
} from "@/lib/members/form";
import { createMemberFormSchema } from "@/lib/validation/schemas";
import type { MemberAccountCredentials } from "@/types/members";

export function CreateMemberContent() {
  const router = useRouter();
  const [createdAccount, setCreatedAccount] = useState<{
    memberName: string;
    account: MemberAccountCredentials;
  } | null>(null);
  const createMember = useCreateMember();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(createMemberFormSchema({ requireLogin: true })),
    defaultValues: emptyMemberFormValues("visitor"),
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await createMember.mutateAsync(formValuesToCreatePayload(values));
      setCreatedAccount({
        memberName: result.name,
        account: result.account,
      });
    } catch (submitError) {
      form.setError("root", {
        message:
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível cadastrar o membro.",
      });
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

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <UserPlus className="size-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="font-display text-xl">
                  Novo cadastro
                </CardTitle>
                <CardDescription className="mt-1">
                  Preencha os dados da pessoa. Um login com senha temporária será
                  criado automaticamente (e-mail ou CPF obrigatório).
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                {form.formState.errors.root?.message && (
                  <FormAlert>{form.formState.errors.root.message}</FormAlert>
                )}

                <MemberForm
                  requireLogin
                  disabled={createMember.isPending}
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
    </>
  );
}
