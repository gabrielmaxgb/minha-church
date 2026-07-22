"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";

import {
  SettingsDetailHeader,
  SettingsPanel,
} from "@/components/dashboard/settings/settings-shared";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validation/schemas";
import { toastError } from "@/lib/ui/toast";
import { useAuth, useRequireAuth } from "@/providers/auth-provider";

type ChangePasswordVariant = "required" | "voluntary";

interface ChangePasswordContentProps {
  variant?: ChangePasswordVariant;
}

const SECURITY_TIPS = [
  "Evite reutilizar a mesma senha de outros serviços.",
  "Prefira combinações difíceis de adivinhar.",
  "Troque a senha se suspeitar de acesso indevido.",
] as const;

function PasswordInput({
  id,
  show,
  onToggle,
  disabled,
  invalid,
  autoComplete,
  ...inputProps
}: {
  id: string;
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
  invalid?: boolean;
  autoComplete?: string;
} & React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        disabled={disabled}
        className="h-11 rounded-lg border-input/80 bg-surface-elevated pr-11"
        aria-invalid={invalid || undefined}
        {...inputProps}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={show ? "Ocultar senha" : "Exibir senha"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function ChangePasswordContent({
  variant = "required",
}: ChangePasswordContentProps) {
  const router = useRouter();
  const { changePassword, logout } = useAuth();
  const { user, isLoading } = useRequireAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isRequired = variant === "required";

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");
    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      router.replace(
        isRequired ? AUTH_ROUTES.dashboard : AUTH_ROUTES.settings,
      );
    } catch (submitError) {
      toastError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  async function handleBackToLogin() {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    }
  }

  if (isLoading || !user) {
    if (isRequired) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface">
          <p className="animate-pulse text-sm text-muted-foreground">
            Carregando...
          </p>
        </div>
      );
    }

    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  const currentLabel = isRequired ? "Senha temporária atual" : "Senha atual";
  const heroTitle = isRequired ? "Defina sua senha" : "Segurança da conta";
  const heroDescription = isRequired
    ? "Por segurança, troque a senha temporária antes de acessar o painel."
    : "Mantenha sua conta protegida com uma senha forte e exclusiva.";

  const formPanel = (
    <SettingsPanel>
      <SettingsDetailHeader
        title={isRequired ? "Nova senha de acesso" : "Alterar senha"}
        description="Informe a senha atual e defina a nova credencial."
      />

      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-4 px-5 py-5">
          <FormField
            label={currentLabel}
            htmlFor="current-password"
            error={errors.currentPassword?.message}
            required
          >
            <PasswordInput
              id="current-password"
              show={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((prev) => !prev)}
              disabled={isSubmitting}
              invalid={Boolean(errors.currentPassword)}
              autoComplete="current-password"
              {...register("currentPassword")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Nova senha"
              htmlFor="new-password"
              error={errors.newPassword?.message}
              hint="Mínimo de 6 caracteres."
              required
            >
              <PasswordInput
                id="new-password"
                show={showNewPassword}
                onToggle={() => setShowNewPassword((prev) => !prev)}
                disabled={isSubmitting}
                invalid={Boolean(errors.newPassword)}
                autoComplete="new-password"
                {...register("newPassword")}
              />
            </FormField>

            <FormField
              label="Confirmar nova senha"
              htmlFor="confirm-password"
              error={errors.confirmPassword?.message}
              required
            >
              <PasswordInput
                id="confirm-password"
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isSubmitting}
                invalid={Boolean(errors.confirmPassword)}
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </FormField>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col-reverse gap-2 border-t border-border/70 bg-muted/25 px-5 py-4 sm:flex-row",
            isRequired ? "sm:flex-col sm:items-stretch" : "sm:justify-end",
          )}
        >
          {!isRequired && (
            <Button
              type="button"
              variant="ghost"
              asChild
              disabled={isSubmitting}
              className="sm:mr-auto"
            >
              <Link href={AUTH_ROUTES.settings}>
                <ArrowLeft className="size-4" />
                Voltar às configurações
              </Link>
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || isLoggingOut}
            className={isRequired ? "w-full sm:ml-0" : undefined}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar nova senha"
            )}
          </Button>
          {isRequired && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              disabled={isSubmitting || isLoggingOut}
              onClick={() => void handleBackToLogin()}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saindo...
                </>
              ) : (
                <>
                  <ArrowLeft className="size-4" />
                  Voltar ao login
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </SettingsPanel>
  );

  const tipsPanel = (
    <aside className="rounded-lg border border-border bg-muted/20 p-5">
      <div className="flex items-center gap-2 text-foreground">
        <ShieldCheck className="size-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold tracking-tight">Boas práticas</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {SECURITY_TIPS.map((tip) => (
          <li
            key={tip}
            className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
          >
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70"
              aria-hidden
            />
            {tip}
          </li>
        ))}
      </ul>
    </aside>
  );

  const hero = (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/20 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <KeyRound className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {heroTitle}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {heroDescription}
          </p>
        </div>
      </div>
    </div>
  );

  if (isRequired) {
    return (
      <div className="flex min-h-screen flex-col bg-surface">
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-lg space-y-6">
            {hero}
            {formPanel}
            {tipsPanel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hero}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:items-start">
        {formPanel}
        {tipsPanel}
      </div>
    </div>
  );
}
