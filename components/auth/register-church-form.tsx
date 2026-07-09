"use client";

import Link from "next/link";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormAlert, FormField, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import {
  registerChurchSchema,
  type RegisterChurchFormValues,
} from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function RegisterChurchForm() {
  const { registerChurch, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterChurchFormValues>({
    resolver: zodResolver(registerChurchSchema),
    defaultValues: {
      churchName: "",
      ownerName: "",
      ownerEmail: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

    window.location.replace(AUTH_ROUTES.dashboard);
  }, [isAuthenticated, isAuthLoading]);

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");
    setIsLoading(true);

    try {
      await registerChurch({
        churchName: values.churchName.trim(),
        ownerName: values.ownerName.trim(),
        ownerEmail: values.ownerEmail.trim().toLowerCase(),
        password: values.password,
        acceptTerms: values.acceptTerms,
      });

      window.location.replace(AUTH_ROUTES.dashboard);
    } catch (submitError) {
      setError("root", {
        message:
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível criar sua igreja. Tente novamente.",
      });
      setIsLoading(false);
    }
  });

  return (
    <Card className="w-full max-w-lg border-border shadow-none">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="size-6" aria-hidden />
        </div>

        <div className="space-y-2">
          <CardTitle className="font-display text-2xl">
            Criar conta da igreja
          </CardTitle>
          <CardDescription className="text-balance">
            Cadastro rápido para começar a organizar membros, comunicados e
            escalas.
          </CardDescription>
        </div>

        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" aria-hidden />
          Grátis para começar — sem cartão
        </div>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          {errors.root?.message && <FormAlert>{errors.root.message}</FormAlert>}

          <FormField
            label="Nome da igreja"
            htmlFor="churchName"
            error={errors.churchName?.message}
            required
          >
            <Input
              id="churchName"
              type="text"
              placeholder="Ex.: Igreja Batista Central"
              autoComplete="organization"
              disabled={isLoading}
              aria-invalid={errors.churchName ? true : undefined}
              {...register("churchName")}
            />
          </FormField>

          <FormField
            label="Seu nome"
            htmlFor="ownerName"
            error={errors.ownerName?.message}
            required
          >
            <Input
              id="ownerName"
              type="text"
              placeholder="Como você é conhecido na liderança"
              autoComplete="name"
              disabled={isLoading}
              aria-invalid={errors.ownerName ? true : undefined}
              {...register("ownerName")}
            />
          </FormField>

          <FormField
            label="Seu e-mail"
            htmlFor="ownerEmail"
            error={errors.ownerEmail?.message}
            required
          >
            <Input
              id="ownerEmail"
              type="email"
              placeholder="pastor@igreja.com.br"
              autoComplete="email"
              disabled={isLoading}
              aria-invalid={errors.ownerEmail ? true : undefined}
              {...register("ownerEmail")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none text-foreground"
              >
                Senha
                <span className="ml-0.5 text-destructive" aria-hidden>
                  *
                </span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="pr-10"
                  aria-invalid={errors.password ? true : undefined}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FormMessage>{errors.password?.message}</FormMessage>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium leading-none text-foreground"
              >
                Confirmar senha
                <span className="ml-0.5 text-destructive" aria-hidden>
                  *
                </span>
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="pr-10"
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Exibir senha"
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FormMessage>{errors.confirmPassword?.message}</FormMessage>
            </div>
          </div>

          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors",
                    errors.acceptTerms
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-border/70 bg-muted/10 hover:bg-muted/20",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={field.value === true}
                    onChange={(event) =>
                      field.onChange(event.target.checked ? true : false)
                    }
                    onBlur={field.onBlur}
                    disabled={isLoading}
                    className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                    aria-invalid={errors.acceptTerms ? true : undefined}
                  />
                  <span className="text-sm leading-relaxed text-foreground">
                    Li e aceito os{" "}
                    <Link
                      href={PUBLIC_ROUTES.security}
                      className="font-medium underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Termos de Uso e Política de Privacidade
                    </Link>
                    .
                  </span>
                </label>
                <FormMessage>{errors.acceptTerms?.message}</FormMessage>
              </div>
            )}
          />

          {!process.env.NEXT_PUBLIC_API_URL?.trim() && (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              Configure <code className="text-foreground">NEXT_PUBLIC_API_URL</code>{" "}
              no <code className="text-foreground">.env.local</code> apontando para
              o backend Nest.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Criando sua igreja..." : "Criar conta grátis"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              href={PUBLIC_ROUTES.login}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
