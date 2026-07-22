"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ShieldCheck } from "lucide-react";

import { StripeBrandInline } from "@/components/brand/stripe-mark";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { FloatingSaveBar } from "@/components/ui/floating-save-bar";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";
import {
  useUpsertFiscalProfile,
} from "@/lib/api/queries";
import type { FiscalProfile } from "@/lib/api/payments";
import { formatCnpjInput, formatCpfInput } from "@/lib/validation/shared";
import {
  fiscalProfileSchema,
  type FiscalProfileFormValues,
} from "@/lib/validation/schemas";
import { BR_STATES, formatBrPhoneInput } from "@/lib/geo/br-states";
import { toastApiError, toastSuccess } from "@/lib/ui/toast";
import { useAuth } from "@/providers/auth-provider";

import { SettingsPanel } from "./settings-shared";

function buildFiscalValues(
  profile: FiscalProfile | null,
): FiscalProfileFormValues {
  return {
    documentType: profile?.documentType ?? "cnpj",
    documentNumber: profile
      ? profile.documentType === "cnpj"
        ? formatCnpjInput(profile.documentNumber)
        : formatCpfInput(profile.documentNumber)
      : "",
    legalName: profile?.legalName ?? "",
    responsibleName: profile?.responsibleName ?? "",
    responsibleDocument: profile?.responsibleDocument
      ? formatCpfInput(profile.responsibleDocument)
      : "",
    confirmNoCnpj: profile?.documentType === "cpf",
    contactPhone: profile?.contactPhone
      ? formatBrPhoneInput(profile.contactPhone)
      : "",
    city: profile?.city ?? "",
    state: profile?.state?.toUpperCase() ?? "",
  };
}

export function ChurchFiscalProfileForm({
  profile,
  locked = false,
}: {
  profile: FiscalProfile | null;
  /** Conta bloqueada: campos em leitura, sem salvar. */
  locked?: boolean;
}) {
  const { user, church } = useAuth();
  const upsert = useUpsertFiscalProfile();
  const ownerCpfFormatted = user?.cpf ? formatCpfInput(user.cpf) : "";
  const inputsDisabled = upsert.isPending || locked;

  const form = useForm<FiscalProfileFormValues>({
    resolver: zodResolver(fiscalProfileSchema),
    defaultValues: buildFiscalValues(profile),
    mode: "onChange",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const documentType = watch("documentType");

  useEffect(() => {
    reset(buildFiscalValues(profile));
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await upsert.mutateAsync({
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        legalName: values.legalName,
        responsibleName: values.responsibleName,
        responsibleDocument:
          values.documentType === "cnpj"
            ? values.responsibleDocument || null
            : null,
        confirmNoCnpj:
          values.documentType === "cpf" ? values.confirmNoCnpj === true : undefined,
        contactPhone: values.contactPhone,
        city: values.city,
        state: values.state,
      });

      toastSuccess("Perfil da igreja salvo com sucesso.");
    } catch (submitError) {
      toastApiError(
        submitError,
        "Não foi possível salvar o perfil da igreja.",
      );
    }
  });

  const lockDocumentType = Boolean(
    profile &&
      (profile.documentType === "cnpj" || profile.documentType === "cpf"),
  );

  return (
    <>
      <form
        id="church-fiscal-profile-form"
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
      >
        {locked && (
          <FormAlert variant="info">
            Sua conta está sem um plano ativo. Você pode consultar os dados da
            igreja, mas para editá-los é preciso reativar a assinatura.
          </FormAlert>
        )}

        <SettingsPanel>
          <div className="space-y-4 px-5 py-5">
            <div>
              <p className="text-sm font-medium text-foreground">
                Contato e localização
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                WhatsApp e cidade da igreja — para suporte e para liberar
                recebimentos.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="WhatsApp do responsável"
                htmlFor="fiscal-contact-phone"
                error={errors.contactPhone?.message}
                required
              >
                <Controller
                  name="contactPhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="fiscal-contact-phone"
                      inputMode="tel"
                      placeholder="(11) 99999-9999"
                      disabled={inputsDisabled}
                      aria-invalid={errors.contactPhone ? true : undefined}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(formatBrPhoneInput(event.target.value))
                      }
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Cidade"
                htmlFor="fiscal-city"
                error={errors.city?.message}
                required
              >
                <Input
                  id="fiscal-city"
                  disabled={inputsDisabled}
                  aria-invalid={errors.city ? true : undefined}
                  {...register("city")}
                />
              </FormField>
            </div>

            <FormField
              label="UF"
              htmlFor="fiscal-state"
              error={errors.state?.message}
              required
            >
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <SelectField
                    id="fiscal-state"
                    disabled={inputsDisabled}
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(event.target.value.toUpperCase())
                    }
                    onBlur={field.onBlur}
                  >
                    <option value="">Selecione</option>
                    {BR_STATES.map((item) => (
                      <option key={item.uf} value={item.uf}>
                        {item.uf} — {item.name}
                      </option>
                    ))}
                  </SelectField>
                )}
              />
            </FormField>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className="space-y-4 px-5 py-5">
            <div>
              <p className="text-sm font-medium text-foreground">
                Identificação fiscal
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                O ideal é usar o CNPJ da igreja. Assim as doações caem em uma
                conta no nome da própria igreja, o dinheiro fica separado das
                finanças pessoais e a prestação de contas fica mais simples. Se
                a igreja ainda não tem CNPJ, dá para começar com o CPF de quem
                cuida da conta e mudar depois.
              </p>
            </div>

            <label
              className={cn(
                "flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-4 py-3",
                documentType === "cpf"
                  ? "border-attention-border bg-attention-subtle"
                  : "border-border bg-muted/20",
                (inputsDisabled ||
                  (lockDocumentType && profile?.documentType === "cnpj")) &&
                  "cursor-not-allowed opacity-70",
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Minha igreja não tem CNPJ
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Ao marcar, as doações passam a cair em uma conta no nome
                  {user?.name ? ` de ${user.name}` : " de quem cuida da conta"}{" "}
                  (pessoa física), não da igreja. Use só enquanto a igreja não
                  tiver CNPJ — quando tiver, é possível trocar.
                </p>
              </div>
              <input
                type="checkbox"
                role="switch"
                className="mt-1 size-4 shrink-0 rounded border-border"
                disabled={
                  inputsDisabled ||
                  (lockDocumentType && profile?.documentType === "cnpj")
                }
                checked={documentType === "cpf"}
                onChange={(event) => {
                  const withoutCnpj = event.target.checked;
                  if (withoutCnpj) {
                    setValue("documentType", "cpf", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue("confirmNoCnpj", true, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    if (ownerCpfFormatted) {
                      setValue("documentNumber", ownerCpfFormatted, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                    if (user?.name && !getValues("responsibleName")) {
                      setValue("responsibleName", user.name, {
                        shouldDirty: true,
                      });
                    }
                    if (church?.name && !getValues("legalName")) {
                      setValue("legalName", church.name, { shouldDirty: true });
                    }
                  } else {
                    setValue("documentType", "cnpj", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue("confirmNoCnpj", false, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue("documentNumber", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    if (ownerCpfFormatted) {
                      setValue("responsibleDocument", ownerCpfFormatted, {
                        shouldDirty: true,
                      });
                    }
                  }
                }}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={
                  documentType === "cnpj"
                    ? "CNPJ da igreja"
                    : "CPF de quem cuida da conta"
                }
                htmlFor="fiscal-doc-number"
                error={errors.documentNumber?.message}
                required
                hint={
                  documentType === "cpf" && !ownerCpfFormatted
                    ? "Ainda não temos seu CPF — informe abaixo."
                    : undefined
                }
              >
                <Controller
                  name="documentNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="fiscal-doc-number"
                      inputMode="numeric"
                      placeholder={
                        documentType === "cnpj"
                          ? "00.000.000/0000-00"
                          : "000.000.000-00"
                      }
                      disabled={
                        inputsDisabled ||
                        (documentType === "cpf" && Boolean(ownerCpfFormatted))
                      }
                      aria-invalid={errors.documentNumber ? true : undefined}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(
                          documentType === "cnpj"
                            ? formatCnpjInput(event.target.value)
                            : formatCpfInput(event.target.value),
                        )
                      }
                    />
                  )}
                />
              </FormField>

              {documentType === "cnpj" ? (
                <FormField
                  label="CPF do responsável"
                  htmlFor="fiscal-responsible-doc"
                  error={errors.responsibleDocument?.message}
                  required
                  hint="Quem responde pela igreja — não é o CNPJ."
                >
                  <Controller
                    name="responsibleDocument"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="fiscal-responsible-doc"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        disabled={inputsDisabled}
                        aria-invalid={
                          errors.responsibleDocument ? true : undefined
                        }
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        onChange={(event) =>
                          field.onChange(formatCpfInput(event.target.value))
                        }
                      />
                    )}
                  />
                </FormField>
              ) : (
                <div />
              )}
            </div>

            <FormField
              label={
                documentType === "cnpj"
                  ? "Razão social"
                  : "Nome da igreja / responsável"
              }
              htmlFor="fiscal-legal-name"
              error={errors.legalName?.message}
              required
            >
              <Input
                id="fiscal-legal-name"
                disabled={inputsDisabled}
                aria-invalid={errors.legalName ? true : undefined}
                {...register("legalName")}
              />
            </FormField>

            <FormField
              label="Responsável legal"
              htmlFor="fiscal-responsible-name"
              error={errors.responsibleName?.message}
              required
            >
              <Input
                id="fiscal-responsible-name"
                disabled={inputsDisabled}
                aria-invalid={errors.responsibleName ? true : undefined}
                {...register("responsibleName")}
              />
            </FormField>
          </div>
        </SettingsPanel>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            Usamos esses dados para identificar a igreja e liberar recebimentos.
            Só compartilhamos com o <StripeBrandInline />, que processa os
            pagamentos.
          </p>
        </div>
      </form>

      <FloatingSaveBar
        visible={isDirty && !locked}
        saving={upsert.isPending}
        onDiscard={() => {
          reset(buildFiscalValues(profile));
        }}
        onSave={() => {
          const formEl = document.getElementById(
            "church-fiscal-profile-form",
          ) as HTMLFormElement | null;
          formEl?.requestSubmit();
        }}
      />
    </>
  );
}
