"use client";

import Link from "next/link";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { FormAlert, FormField, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { isRegisterChurchPending } from "@/types/auth";
import {
  registerChurchSchema,
  type RegisterChurchFormValues,
} from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const highlights = [
  {
    icon: Users,
    title: "Membros no lugar certo",
    description: "Cadastro pastoral sem planilha perdida.",
    tone: "text-domain-members-foreground bg-domain-members-subtle",
  },
  {
    icon: CalendarDays,
    title: "Escalas com antecedência",
    description: "Convide, confirme e feche o culto com calma.",
    tone: "text-domain-schedules-foreground bg-domain-schedules-subtle",
  },
  {
    icon: MessageSquare,
    title: "Avisos com histórico",
    description: "Comunique a igreja sem depender só do WhatsApp.",
    tone: "text-domain-communication-foreground bg-domain-communication-subtle",
  },
] as const;

export function RegisterChurchForm() {
  const { registerChurch, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const shouldReduceMotion = useReducedMotion();
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
      const result = await registerChurch({
        churchName: values.churchName.trim(),
        ownerName: values.ownerName.trim(),
        ownerEmail: values.ownerEmail.trim().toLowerCase(),
        password: values.password,
        acceptTerms: values.acceptTerms,
      });

      if (isRegisterChurchPending(result)) {
        const params = new URLSearchParams({
          verify: "sent",
          email: result.email,
        });
        window.location.replace(`${PUBLIC_ROUTES.login}?${params.toString()}`);
        return;
      }

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
    <motion.div
      className="relative w-full"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-popover backdrop-blur-sm lg:grid lg:min-h-[36rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Painel de empolgação */}
        <aside className="relative flex overflow-hidden border-b border-border/60 bg-gradient-to-br from-domain-activities-subtle via-card to-domain-members-subtle/80 px-6 py-8 sm:px-8 sm:py-10 lg:min-h-full lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div
            className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-domain-activities/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-10 size-48 rounded-full bg-attention/20 blur-3xl"
            aria-hidden
          />

          <div className="relative my-auto space-y-6">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-attention-border bg-attention-subtle px-3 py-1 text-xs font-medium text-attention-foreground">
              <Sparkles className="size-3.5" aria-hidden />
              30 dias grátis · sem cartão
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Sua igreja organizada a partir de hoje
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                Monte o espaço da comunidade em minutos e comece a semana com
                clareza — membros, escalas e avisos no mesmo lugar.
              </p>
            </div>

            <ul className="space-y-3">
              {highlights.map((item) => (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/70 p-3"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      item.tone,
                    )}
                  >
                    <item.icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground">
              Depois do trial, faixas a partir de{" "}
              <span className="font-medium text-foreground">R$ 119/mês</span>.
            </p>
          </div>
        </aside>

        {/* Formulário */}
        <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Criar conta da igreja
            </h2>
            <p className="text-sm text-muted-foreground">
              Preencha os dados e entre liberado por 30 dias.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {errors.root?.message && (
              <FormAlert>{errors.root.message}</FormAlert>
            )}

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
                        : "border-border/70 bg-muted/20 hover:bg-muted/35",
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
                Configure{" "}
                <code className="text-foreground">NEXT_PUBLIC_API_URL</code> no{" "}
                <code className="text-foreground">.env.local</code> apontando
                para o backend Nest.
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Criando sua igreja..." : "Começar grátis agora"}
              {!isLoading && <ArrowRight className="size-4" aria-hidden />}
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
          </form>
        </div>
      </div>
    </motion.div>
  );
}
