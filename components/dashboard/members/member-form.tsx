"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  MEMBER_STATUS_FORM_LABELS,
  type MemberFormValues,
} from "@/lib/members/form";
import { formatCpfInput } from "@/lib/validation/shared";
import type { Gender, MaritalStatus, MemberStatus } from "@/types/members";

interface MemberFormProps {
  disabled?: boolean;
  showStatus?: boolean;
  requireLogin?: boolean;
}

function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function errorMessage(
  errors: ReturnType<typeof useFormContext<MemberFormValues>>["formState"]["errors"],
  field: keyof MemberFormValues,
) {
  return errors[field]?.message as string | undefined;
}

export function MemberForm({
  disabled = false,
  showStatus = true,
  requireLogin = false,
}: MemberFormProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<MemberFormValues>();

  const status = watch("status");
  const maritalStatus = watch("maritalStatus");

  useEffect(() => {
    if (maritalStatus !== "married") {
      setValue("weddingAnniversary", "");
    }
  }, [maritalStatus, setValue]);

  return (
    <div className="space-y-8">
      <FieldGroup
        title="Identificação"
        description={
          requireLogin
            ? "Informe e-mail ou CPF (obrigatório um dos dois) para criar o login de acesso."
            : "Dados principais de contato."
        }
      >
        <FormField
          className="sm:col-span-2"
          label="Nome completo"
          htmlFor="member-name"
          error={errorMessage(errors, "name")}
          required
        >
          <Input
            id="member-name"
            placeholder="Nome da pessoa"
            disabled={disabled}
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
        </FormField>

        {showStatus && (
          <FormField label="Status" htmlFor="member-status">
            <SelectField
              id="member-status"
              disabled={disabled}
              {...register("status")}
            >
              {(Object.keys(MEMBER_STATUS_FORM_LABELS) as MemberStatus[]).map(
                (item) => (
                  <option key={item} value={item}>
                    {MEMBER_STATUS_FORM_LABELS[item]}
                  </option>
                ),
              )}
            </SelectField>
          </FormField>
        )}

        <FormField
          label="E-mail"
          htmlFor="member-email"
          error={errorMessage(errors, "email")}
          hint={
            requireLogin ? "Obrigatório se CPF não for informado." : undefined
          }
        >
          <Input
            id="member-email"
            type="email"
            placeholder="email@exemplo.com"
            disabled={disabled}
            aria-invalid={errors.email ? true : undefined}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="CPF"
          htmlFor="member-cpf"
          error={errorMessage(errors, "cpf")}
          hint={
            requireLogin ? "Obrigatório se e-mail não for informado." : undefined
          }
        >
          <Controller
            name="cpf"
            control={control}
            render={({ field }) => (
              <Input
                id="member-cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                disabled={disabled}
                aria-invalid={errors.cpf ? true : undefined}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(formatCpfInput(event.target.value))
                }
              />
            )}
          />
        </FormField>

        <FormField label="Telefone" htmlFor="member-phone">
          <Input
            id="member-phone"
            placeholder="(00) 00000-0000"
            disabled={disabled}
            {...register("phone")}
          />
        </FormField>

        <FormField label="Telefone secundário" htmlFor="member-phone-secondary">
          <Input
            id="member-phone-secondary"
            disabled={disabled}
            {...register("phoneSecondary")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup title="Dados pessoais">
        <FormField label="Data de nascimento" htmlFor="member-birth-date">
          <Input
            id="member-birth-date"
            type="date"
            disabled={disabled}
            {...register("birthDate")}
          />
        </FormField>

        <FormField label="Gênero" htmlFor="member-gender">
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <SelectField
                id="member-gender"
                disabled={disabled}
                value={field.value}
                onChange={(event) =>
                  field.onChange(event.target.value as Gender | "")
                }
                onBlur={field.onBlur}
              >
                <option value="">Não informado</option>
                {(Object.keys(GENDER_LABELS) as Gender[]).map((gender) => (
                  <option key={gender} value={gender}>
                    {GENDER_LABELS[gender]}
                  </option>
                ))}
              </SelectField>
            )}
          />
        </FormField>

        <FormField label="Estado civil" htmlFor="member-marital-status">
          <Controller
            name="maritalStatus"
            control={control}
            render={({ field }) => (
              <SelectField
                id="member-marital-status"
                disabled={disabled}
                value={field.value}
                onChange={(event) =>
                  field.onChange(event.target.value as MaritalStatus | "")
                }
                onBlur={field.onBlur}
              >
                <option value="">Não informado</option>
                {(Object.keys(MARITAL_STATUS_LABELS) as MaritalStatus[]).map(
                  (item) => (
                    <option key={item} value={item}>
                      {MARITAL_STATUS_LABELS[item]}
                    </option>
                  ),
                )}
              </SelectField>
            )}
          />
        </FormField>

        {maritalStatus === "married" && (
          <FormField
            label="Aniversário de casamento"
            htmlFor="member-wedding-anniversary"
          >
            <Input
              id="member-wedding-anniversary"
              type="date"
              disabled={disabled}
              {...register("weddingAnniversary")}
            />
          </FormField>
        )}
      </FieldGroup>

      <FieldGroup title="Endereço">
        <FormField className="sm:col-span-2" label="Rua" htmlFor="member-street">
          <Input id="member-street" disabled={disabled} {...register("street")} />
        </FormField>

        <FormField label="Número" htmlFor="member-number">
          <Input id="member-number" disabled={disabled} {...register("number")} />
        </FormField>

        <FormField label="Complemento" htmlFor="member-complement">
          <Input
            id="member-complement"
            disabled={disabled}
            {...register("complement")}
          />
        </FormField>

        <FormField label="Bairro" htmlFor="member-neighborhood">
          <Input
            id="member-neighborhood"
            disabled={disabled}
            {...register("neighborhood")}
          />
        </FormField>

        <FormField label="Cidade" htmlFor="member-city">
          <Input id="member-city" disabled={disabled} {...register("city")} />
        </FormField>

        <FormField
          label="Estado"
          htmlFor="member-state"
          error={errorMessage(errors, "state")}
          hint="Sigla com 2 letras"
        >
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Input
                id="member-state"
                placeholder="SP"
                maxLength={2}
                disabled={disabled}
                aria-invalid={errors.state ? true : undefined}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(event.target.value.toUpperCase())
                }
              />
            )}
          />
        </FormField>

        <FormField
          label="CEP"
          htmlFor="member-zip-code"
          error={errorMessage(errors, "zipCode")}
        >
          <Input
            id="member-zip-code"
            placeholder="00000-000"
            disabled={disabled}
            aria-invalid={errors.zipCode ? true : undefined}
            {...register("zipCode")}
          />
        </FormField>
      </FieldGroup>

      <FieldGroup
        title="Vida na igreja"
        description="Datas importantes no histórico pastoral."
      >
        <FormField label="Visitante desde" htmlFor="member-visitor-since">
          <Input
            id="member-visitor-since"
            type="date"
            disabled={disabled || status !== "visitor"}
            {...register("visitorSince")}
          />
        </FormField>

        <FormField
          label="Membro desde"
          htmlFor="member-membership-date"
          error={errorMessage(errors, "membershipDate")}
        >
          <Input
            id="member-membership-date"
            type="date"
            disabled={disabled || status !== "active"}
            aria-invalid={errors.membershipDate ? true : undefined}
            {...register("membershipDate")}
          />
        </FormField>

        <FormField label="Data de batismo" htmlFor="member-baptism-date">
          <Input
            id="member-baptism-date"
            type="date"
            disabled={disabled}
            {...register("baptismDate")}
          />
        </FormField>
      </FieldGroup>
    </div>
  );
}
