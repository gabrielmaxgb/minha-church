"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";

import { MemberForm } from "@/components/dashboard/members/member-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AUTH_ROUTES } from "@/constants/routes";
import { useCreateMember } from "@/lib/api/queries";
import {
  emptyMemberFormValues,
  formValuesToCreatePayload,
} from "@/lib/members/form";

export function CreateMemberContent() {
  const [values, setValues] = useState(emptyMemberFormValues("visitor"));
  const [error, setError] = useState<string | null>(null);
  const createMember = useCreateMember();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("Informe o nome da pessoa.");
      return;
    }

    try {
      await createMember.mutateAsync(formValuesToCreatePayload(values));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível cadastrar o membro.",
      );
    }
  }

  return (
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
                Preencha os dados da pessoa. Por padrão ela entra como visitante.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-border bg-muted/60 px-3 py-2.5 text-sm"
              >
                {error}
              </div>
            )}

            <MemberForm values={values} onChange={setValues} disabled={createMember.isPending} />

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href={AUTH_ROUTES.members}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={createMember.isPending || !values.name.trim()}>
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
        </CardContent>
      </Card>
    </div>
  );
}
