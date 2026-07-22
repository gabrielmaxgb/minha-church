"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Smartphone } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { FloatingSaveBar } from "@/components/ui/floating-save-bar";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import { useMyMember } from "@/lib/api/queries";
import { membersKeys } from "@/lib/api/queries/members.keys";
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
} from "@/lib/members/form";
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
import { useAuth, useTenant } from "@/providers/auth-provider";
import { toastApiError, toastSuccess } from "@/lib/ui/toast";
import type { Gender, MaritalStatus, Member } from "@/types/members";

import {
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";
import { AccountPrivacyPanel } from "./account-privacy-panel";
import { PushNotificationsPanel } from "@/components/pwa/push-notifications-panel";

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.split("T")[0] ?? "";
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function buildFormValues(
  user: NonNullable<ReturnType<typeof useAuth>["user"]>,
  member: Member | null | undefined,
): ProfileFormValues {
  return {
    name: user.name,
    email: getProfileEmailValue(user),
    phone: member?.phone ?? user.phone ?? "",
    phoneSecondary: member?.phoneSecondary ?? "",
    birthDate: toDateInputValue(member?.birthDate),
    gender: member?.gender ?? "",
    maritalStatus: member?.maritalStatus ?? "",
    weddingAnniversary: toDateInputValue(member?.weddingAnniversary),
    street: member?.street ?? "",
    number: member?.number ?? "",
    complement: member?.complement ?? "",
    neighborhood: member?.neighborhood ?? "",
    city: member?.city ?? "",
    state: member?.state ?? "",
    zipCode: member?.zipCode ?? "",
  };
}

function ProfileSettingsForm({
  user,
  member,
  hasMemberProfile,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  member: Member | null | undefined;
  hasMemberProfile: boolean;
}) {
  const { updateProfile } = useAuth();
  const { churchId, church } = useTenant();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(createProfileSchema(!user.cpf)),
    defaultValues: buildFormValues(user, member),
    mode: "onBlur",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const maritalStatus = watch("maritalStatus");

  useEffect(() => {
    reset(buildFormValues(user, member));
  }, [user, member, reset]);

  useEffect(() => {
    if (maritalStatus !== "married") {
      setValue("weddingAnniversary", "");
    }
  }, [maritalStatus, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true);

    try {
      await updateProfile({
        name: values.name.trim(),
        email: values.email.trim() || null,
        phone: nullable(values.phone),
        phoneSecondary: nullable(values.phoneSecondary),
        birthDate: nullable(values.birthDate),
        gender: (values.gender || null) as Gender | null,
        maritalStatus: (values.maritalStatus || null) as MaritalStatus | null,
        weddingAnniversary:
          values.maritalStatus === "married"
            ? nullable(values.weddingAnniversary)
            : null,
        street: nullable(values.street),
        number: nullable(values.number),
        complement: nullable(values.complement),
        neighborhood: nullable(values.neighborhood),
        city: nullable(values.city),
        state: nullable(values.state)?.toUpperCase() ?? null,
        zipCode: nullable(values.zipCode),
      });

      if (churchId) {
        await queryClient.invalidateQueries({
          queryKey: membersKeys.me(churchId).queryKey,
        });
      }

      toastSuccess("Perfil atualizado com sucesso.");
    } catch (submitError) {
      toastApiError(submitError, "Não foi possível salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <div>
      <SettingsSectionHeader
        title="Perfil"
        description="Atualize seus dados pessoais, de contato e endereço."
      />

      {!hasMemberProfile && (
        <div className="mb-4 rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Ainda não há ficha pastoral vinculada à sua conta nesta igreja. Os
          dados de nascimento, gênero e endereço ficam disponíveis quando a
          liderança vincular seu cadastro de membro.
        </div>
      )}

      <SettingsPanel className="mb-4">
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

      <form
        id="profile-settings-form"
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
      >
        <SettingsPanel>
          <div className="space-y-4 px-5 py-5">
            <p className="text-sm font-medium text-foreground">Conta</p>

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
                  defaultValue={formatCpf(user.cpf)}
                  disabled
                  readOnly
                />
              </FormField>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Telefone" htmlFor="profile-phone">
                <Input
                  id="profile-phone"
                  placeholder="(00) 00000-0000"
                  disabled={isSaving || !hasMemberProfile}
                  {...register("phone")}
                />
              </FormField>

              <FormField
                label="Telefone secundário"
                htmlFor="profile-phone-secondary"
              >
                <Input
                  id="profile-phone-secondary"
                  placeholder="Opcional"
                  disabled={isSaving || !hasMemberProfile}
                  {...register("phoneSecondary")}
                />
              </FormField>
            </div>
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

        {hasMemberProfile && (
          <>
            <SettingsPanel>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Dados pessoais
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Usados no acompanhamento pastoral, aniversários e
                    aconselhamentos.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Data de nascimento"
                    htmlFor="profile-birth-date"
                  >
                    <Controller
                      name="birthDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          id="profile-birth-date"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isSaving}
                          toYear={new Date().getFullYear()}
                        />
                      )}
                    />
                  </FormField>

                  <FormField label="Gênero" htmlFor="profile-gender">
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <SelectField
                          id="profile-gender"
                          disabled={isSaving}
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.value as Gender | "")
                          }
                          onBlur={field.onBlur}
                        >
                          <option value="">Não informado</option>
                          {(Object.keys(GENDER_LABELS) as Gender[]).map(
                            (gender) => (
                              <option key={gender} value={gender}>
                                {GENDER_LABELS[gender]}
                              </option>
                            ),
                          )}
                        </SelectField>
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Estado civil"
                    htmlFor="profile-marital-status"
                  >
                    <Controller
                      name="maritalStatus"
                      control={control}
                      render={({ field }) => (
                        <SelectField
                          id="profile-marital-status"
                          disabled={isSaving}
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value as MaritalStatus | "",
                            )
                          }
                          onBlur={field.onBlur}
                        >
                          <option value="">Não informado</option>
                          {(
                            Object.keys(
                              MARITAL_STATUS_LABELS,
                            ) as MaritalStatus[]
                          ).map((item) => (
                            <option key={item} value={item}>
                              {MARITAL_STATUS_LABELS[item]}
                            </option>
                          ))}
                        </SelectField>
                      )}
                    />
                  </FormField>

                  {maritalStatus === "married" && (
                    <FormField
                      label="Aniversário de casamento"
                      htmlFor="profile-wedding-anniversary"
                    >
                      <Controller
                        name="weddingAnniversary"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            id="profile-wedding-anniversary"
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSaving}
                          />
                        )}
                      />
                    </FormField>
                  )}
                </div>
              </div>
            </SettingsPanel>

            <SettingsPanel>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Endereço</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Ajuda em visitas e comunicação local. Todos os campos são
                    opcionais.
                  </p>
                </div>

                <FormField
                  label="Rua"
                  htmlFor="profile-street"
                  error={errors.street?.message}
                >
                  <Input
                    id="profile-street"
                    placeholder="Rua, avenida..."
                    disabled={isSaving}
                    {...register("street")}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Número" htmlFor="profile-number">
                    <Input
                      id="profile-number"
                      placeholder="Nº"
                      disabled={isSaving}
                      {...register("number")}
                    />
                  </FormField>

                  <FormField
                    className="sm:col-span-2"
                    label="Complemento"
                    htmlFor="profile-complement"
                  >
                    <Input
                      id="profile-complement"
                      placeholder="Apto, bloco..."
                      disabled={isSaving}
                      {...register("complement")}
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Bairro" htmlFor="profile-neighborhood">
                    <Input
                      id="profile-neighborhood"
                      disabled={isSaving}
                      {...register("neighborhood")}
                    />
                  </FormField>

                  <FormField label="Cidade" htmlFor="profile-city">
                    <Input
                      id="profile-city"
                      disabled={isSaving}
                      {...register("city")}
                    />
                  </FormField>

                  <FormField
                    label="Estado"
                    htmlFor="profile-state"
                    error={errors.state?.message}
                  >
                    <Input
                      id="profile-state"
                      placeholder="SP"
                      maxLength={2}
                      disabled={isSaving}
                      {...register("state")}
                    />
                  </FormField>

                  <FormField
                    label="CEP"
                    htmlFor="profile-zip"
                    error={errors.zipCode?.message}
                  >
                    <Input
                      id="profile-zip"
                      placeholder="00000-000"
                      disabled={isSaving}
                      {...register("zipCode")}
                    />
                  </FormField>
                </div>
              </div>
            </SettingsPanel>
          </>
        )}
      </form>

      <div className="mt-6 lg:hidden">
        <SettingsPanel>
          <div className="flex items-start gap-3 px-5 py-5">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              <Smartphone className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Instalar app
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coloque o Minha Church na tela inicial do celular.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={AUTH_ROUTES.installApp}>Ver como instalar</Link>
              </Button>
            </div>
          </div>
        </SettingsPanel>
      </div>

      <div className="mt-6">
        <PushNotificationsPanel />
      </div>

      <div className="mt-6">
        <AccountPrivacyPanel churchId={church?.id ?? churchId} />
      </div>

      <FloatingSaveBar
        visible={isDirty}
        saving={isSaving}
        onDiscard={() => {
          reset(buildFormValues(user, member));
        }}
        onSave={() => {
          const formEl = document.getElementById(
            "profile-settings-form",
          ) as HTMLFormElement | null;
          formEl?.requestSubmit();
        }}
      />
    </div>
  );
}

export function ProfileSettings() {
  const { user } = useAuth();
  const {
    data: member,
    isLoading,
    isError,
  } = useMyMember({ enabled: Boolean(user) });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <ProfileSettingsForm
      user={user}
      member={isError ? null : member}
      hasMemberProfile={!isError && Boolean(member)}
    />
  );
}
