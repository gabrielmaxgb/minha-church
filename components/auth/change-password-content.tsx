"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES } from "@/constants/routes";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validation/schemas";
import { useAuth, useRequireAuth } from "@/providers/auth-provider";

type ChangePasswordVariant = "required" | "voluntary";

interface ChangePasswordContentProps {
  variant?: ChangePasswordVariant;
}

export function ChangePasswordContent({
  variant = "required",
}: ChangePasswordContentProps) {
  const router = useRouter();
  const { changePassword } = useAuth();
  const { user, isLoading } = useRequireAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError("root", {
        message:
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível alterar a senha.",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading || !user) {
    if (isRequired) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      );
    }

    return (
      <p className="text-sm text-muted-foreground">Carregando...</p>
    );
  }

  const formCard = (
    <Card
      className={
        isRequired
          ? "w-full max-w-md border-border shadow-none"
          : "max-w-lg border-border shadow-none"
      }
    >
      <CardHeader className={isRequired ? "text-center" : undefined}>
        {isRequired && (
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <KeyRound className="size-5" aria-hidden />
          </div>
        )}
        <CardTitle className={isRequired ? "font-display text-2xl" : "text-lg"}>
          {isRequired ? "Defina sua senha" : "Alterar senha"}
        </CardTitle>
        <CardDescription>
          {isRequired
            ? "Por segurança, troque a senha temporária antes de continuar."
            : "Informe sua senha atual e escolha uma nova senha de acesso."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          {errors.root?.message && <FormAlert>{errors.root.message}</FormAlert>}

          <FormField
            label={isRequired ? "Senha temporária atual" : "Senha atual"}
            htmlFor="current-password"
            error={errors.currentPassword?.message}
            required
          >
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isSubmitting}
                className="pr-10"
                aria-invalid={errors.currentPassword ? true : undefined}
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showCurrentPassword ? "Ocultar senha" : "Exibir senha"}
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </FormField>

          <FormField
            label="Nova senha"
            htmlFor="new-password"
            error={errors.newPassword?.message}
            hint="Mínimo de 6 caracteres."
            required
          >
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isSubmitting}
                className="pr-10"
                aria-invalid={errors.newPassword ? true : undefined}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showNewPassword ? "Ocultar senha" : "Exibir senha"}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </FormField>

          <FormField
            label="Confirmar nova senha"
            htmlFor="confirm-password"
            error={errors.confirmPassword?.message}
            required
          >
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={errors.confirmPassword ? true : undefined}
              {...register("confirmPassword")}
            />
          </FormField>
        </CardContent>

        <div className="flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-end">
          {!isRequired && (
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href={AUTH_ROUTES.settings}>Cancelar</Link>
            </Button>
          )}
          <Button
            type="submit"
            className={isRequired ? "w-full" : undefined}
            disabled={isSubmitting}
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
        </div>
      </form>
    </Card>
  );

  if (isRequired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
        {formCard}
      </div>
    );
  }

  return formCard;
}