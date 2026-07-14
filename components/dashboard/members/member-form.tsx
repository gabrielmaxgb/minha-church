"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Church,
  IdCard,
  MapPin,
  Phone,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  MEMBER_STATUS_FORM_LABELS,
  type MemberFormValues,
} from "@/lib/members/form";
import { useCreateFamily, useFamilies } from "@/lib/api/queries";
import { familyGraphPath } from "@/constants/routes";
import { canManageMembers } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { formatCpfInput } from "@/lib/validation/shared";
import { useAuth } from "@/providers/auth-provider";
import type { Gender, MaritalStatus, MemberStatus } from "@/types/members";

interface MemberFormProps {
  disabled?: boolean;
  showStatus?: boolean;
  requireLogin?: boolean;
  /**
   * Quando true, impede promover para "Membro ativo" (conta da igreja bloqueada).
   * Mantém a opção se o status atual já for active (edição).
   */
  blockActivePromotion?: boolean;
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <header className="flex items-start gap-3 border-b border-border bg-muted/25 px-5 py-4 sm:px-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-sm font-medium tracking-tight">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </header>
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-5 sm:p-6">
        {children}
      </div>
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
  blockActivePromotion = false,
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
  const { permissions } = useAuth();
  const canManage = permissions ? canManageMembers(permissions) : false;
  const { data: families = [] } = useFamilies();
  const createFamily = useCreateFamily();
  const [newFamilyName, setNewFamilyName] = useState("");
  const [showNewFamily, setShowNewFamily] = useState(false);

  useEffect(() => {
    if (blockActivePromotion && status === "active") {
      setValue("status", "visitor", { shouldDirty: true, shouldValidate: true });
    }
  }, [blockActivePromotion, status, setValue]);

  useEffect(() => {
    if (maritalStatus !== "married") {
      setValue("weddingAnniversary", "");
    }
  }, [maritalStatus, setValue]);

  async function handleCreateFamily() {
    const name = newFamilyName.trim();
    if (name.length < 2 || createFamily.isPending) {
      return;
    }

    try {
      const family = await createFamily.mutateAsync(name);
      setValue("familyId", family.id);
      setNewFamilyName("");
      setShowNewFamily(false);
    } catch {
      // erro fica no mutate; formulário continua editável
    }
  }
  return (
    <div className="space-y-5">
      <FormSection
        icon={UserRound}
        title="Identificação"
        description={
          requireLogin
            ? "Nome e status no cadastro pastoral. E-mail ou CPF será usado no login."
            : "Nome e situação da pessoa na igreja."
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
          <FormField
            label="Status"
            htmlFor="member-status"
            hint={
              blockActivePromotion
                ? "Com a assinatura bloqueada, só é possível cadastrar visitante ou inativo — sem acesso ao painel."
                : status === "active"
                  ? "Membros ativos recebem acesso ao painel (e-mail ou CPF obrigatório)."
                  : "Visitantes e inativos ficam só no cadastro pastoral, sem login."
            }
          >
            <SelectField
              id="member-status"
              disabled={disabled}
              {...register("status")}
            >
              {(Object.keys(MEMBER_STATUS_FORM_LABELS) as MemberStatus[]).map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                    disabled={blockActivePromotion && item === "active"}
                  >
                    {MEMBER_STATUS_FORM_LABELS[item]}
                    {blockActivePromotion && item === "active"
                      ? " (requer assinatura)"
                      : ""}
                  </option>
                ),
              )}
            </SelectField>
          </FormField>
        )}
      </FormSection>

      <FormSection
        icon={Phone}
        title="Contato"
        description={
          requireLogin
            ? "E-mail ou CPF obrigatório para criar o acesso ao painel."
            : "Opcional para visitantes. Será necessário ao receber como membro."
        }
      >
        <FormField
          label="E-mail"
          htmlFor="member-email"
          error={errorMessage(errors, "email")}
          hint={
            requireLogin ? "Obrigatório se o CPF não for informado." : undefined
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
            requireLogin ? "Obrigatório se o e-mail não for informado." : undefined
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
            placeholder="Opcional"
            disabled={disabled}
            {...register("phoneSecondary")}
          />
        </FormField>
      </FormSection>

      <FormSection
        icon={IdCard}
        title="Dados pessoais"
        description="Informações usadas no acompanhamento pastoral e em aniversários."
      >
        <FormField label="Data de nascimento" htmlFor="member-birth-date">
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="member-birth-date"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                toYear={new Date().getFullYear()}
              />
            )}
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
            <Controller
              name="weddingAnniversary"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="member-wedding-anniversary"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
          </FormField>
        )}
      </FormSection>

      <FormSection
        icon={Users}
        title="Família"
        description="Agrupe pessoas da mesma casa. Só um nome — sem complicação."
        className="border-domain-members/20"
      >
        <FormField
          className="sm:col-span-2"
          label="Família"
          htmlFor="member-family"
        >
          <Controller
            name="familyId"
            control={control}
            render={({ field }) => (
              <SelectField
                id="member-family"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
              >
                <option value="">Sem família</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name}
                    {family.memberCount > 0
                      ? ` (${family.memberCount})`
                      : ""}
                  </option>
                ))}
              </SelectField>
            )}
          />
        </FormField>

        {watch("familyId") ? (
          <div className="sm:col-span-2">
            <Link
              href={familyGraphPath(watch("familyId"))}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-domain-members-foreground transition-colors hover:underline"
            >
              Abrir grafo desta família
            </Link>
          </div>
        ) : null}

        {canManage && !disabled && (
          <div className="sm:col-span-2">
            {showNewFamily ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={newFamilyName}
                  onChange={(event) => setNewFamilyName(event.target.value)}
                  placeholder="Ex.: Família Silva"
                  disabled={createFamily.isPending}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void handleCreateFamily()}
                    disabled={
                      createFamily.isPending || newFamilyName.trim().length < 2
                    }
                  >
                    {createFamily.isPending ? "Criando..." : "Criar"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewFamily(false);
                      setNewFamilyName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewFamily(true)}
                className="text-sm font-medium text-domain-members-foreground transition-colors hover:underline"
              >
                + Nova família
              </button>
            )}
            {createFamily.isError && (
              <p className="mt-2 text-sm text-destructive">
                {createFamily.error instanceof Error
                  ? createFamily.error.message
                  : "Não foi possível criar a família."}
              </p>
            )}
          </div>
        )}
      </FormSection>

      <FormSection
        icon={MapPin}
        title="Endereço"
        description="Opcional. Ajuda em visitas e comunicação local."
      >
        <FormField className="sm:col-span-2" label="Rua" htmlFor="member-street">
          <Input
            id="member-street"
            placeholder="Rua, avenida..."
            disabled={disabled}
            {...register("street")}
          />
        </FormField>

        <FormField label="Número" htmlFor="member-number">
          <Input
            id="member-number"
            placeholder="Nº"
            disabled={disabled}
            {...register("number")}
          />
        </FormField>

        <FormField label="Complemento" htmlFor="member-complement">
          <Input
            id="member-complement"
            placeholder="Apto, bloco..."
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
      </FormSection>

      <FormSection
        icon={Church}
        title="Vida na igreja"
        description="Datas do histórico pastoral. Alguns campos dependem do status atual."
      >
        <FormField
          label="Visitante desde"
          htmlFor="member-visitor-since"
          hint={
            status !== "visitor"
              ? "Disponível quando o status é visitante."
              : undefined
          }
        >
          <Controller
            name="visitorSince"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="member-visitor-since"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled || status !== "visitor"}
              />
            )}
          />
        </FormField>

        <FormField
          label="Membro desde"
          htmlFor="member-membership-date"
          error={errorMessage(errors, "membershipDate")}
          hint={
            status !== "active"
              ? "Disponível quando o status é membro ativo."
              : undefined
          }
        >
          <Controller
            name="membershipDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="member-membership-date"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled || status !== "active"}
              />
            )}
          />
        </FormField>

        <FormField label="Data de batismo" htmlFor="member-baptism-date">
          <Controller
            name="baptismDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="member-baptism-date"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </FormField>
      </FormSection>
    </div>
  );
}
