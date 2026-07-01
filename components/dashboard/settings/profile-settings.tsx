"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES } from "@/constants/routes";
import { formatUserAccessLabel } from "@/lib/user-display";
import {
  formatCpf,
  getProfileEmailValue,
  getUserLoginLabel,
} from "@/lib/user-profile";
import {
  createProfileSchema,
  type ProfileFormValues,
} from "@/lib/validation/schemas";
import { useAuth } from "@/providers/auth-provider";

import {
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";

function buildFormValues(user: NonNullable<ReturnType<typeof useAuth>["user"]>): ProfileFormValues {
  return {
    name: user.name,
    email: getProfileEmailValue(user),
    phone: user.phone ?? "",
  };
}

function ProfileSettingsForm({
  user,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  const { updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(createProfileSchema(!user.cpf)),
    defaultValues: buildFormValues(user),
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    reset(buildFormValues(user));
    setSuccess(null);
    clearErrors("root");
  }, [user, reset, clearErrors]);

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");
    setSuccess(null);
    setIsSaving(true);

    try {
      await updateProfile({
        name: values.name.trim(),
        email: values.email.trim() || null,
        phone: values.phone.trim() || null,
      });
      setSuccess("Perfil atualizado com sucesso.");
    } catch (submitError) {
      setError("root", {
        message:
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível salvar o perfil.",
      });
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <div>
      <SettingsSectionHeader
        title="Perfil"
        description="Atualize seus dados pessoais e de contato."
      />

      {errors.root?.message && (
        <div className="mb-4">
          <FormAlert>{errors.root.message}</FormAlert>
        </div>
      )}

      {success && (
        <div className="mb-4">
          <FormAlert variant="success">{success}</FormAlert>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <SettingsPanel>
          <div className="space-y-4 px-5 py-5">
            <FormField
              label="Nome completo"
              htmlFor="profile-name"
              error={errors.name?.message}
              required
            >
              <Input
                id="profile-name"
                disabled={isSaving}
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
            </FormField>

            <FormField
              label="E-mail"
              htmlFor="profile-email"
              error={errors.email?.message}
              hint={
                user.cpf
                  ? "Opcional se você usa CPF para entrar."
                  : undefined
              }
              required={!user.cpf}
            >
              <Input
                id="profile-email"
                type="email"
                placeholder="seu@email.com"
                disabled={isSaving}
                aria-invalid={errors.email ? true : undefined}
                {...register("email")}
              />
            </FormField>

            {user.cpf && (
              <FormField
                label="CPF"
                htmlFor="profile-cpf"
                hint="O CPF é usado como login e não pode ser alterado aqui."
              >
                <Input
                  id="profile-cpf"
                  value={formatCpf(user.cpf)}
                  disabled
                  readOnly
                />
              </FormField>
            )}

            <FormField label="Telefone" htmlFor="profile-phone">
              <Input
                id="profile-phone"
                placeholder="(00) 00000-0000"
                disabled={isSaving}
                {...register("phone")}
              />
            </FormField>
          </div>

          <div className="border-t border-border/70 px-5 py-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Login</dt>
                <dd className="mt-0.5 font-medium">{getUserLoginLabel(user)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Acesso</dt>
                <dd className="mt-0.5 font-medium">
                  {formatUserAccessLabel(user)}
                </dd>
              </div>
            </dl>
          </div>
        </SettingsPanel>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={isSaving || !isDirty}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </form>

      <SettingsPanel className="mt-4">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <KeyRound className="size-4" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-medium">Senha de acesso</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Altere sua senha quando quiser.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" asChild>
            <Link href={AUTH_ROUTES.changePassword}>Alterar senha</Link>
          </Button>
        </div>
      </SettingsPanel>
    </div>
  );
}

export function ProfileSettings() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <ProfileSettingsForm user={user} />;
}
