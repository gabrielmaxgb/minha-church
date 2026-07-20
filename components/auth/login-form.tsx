"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion } from "motion/react";

import { AuthBootSplash } from "@/components/auth/auth-boot-splash";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormAlert, FormField, FormMessage } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  DEMO_ACCOUNTS,
  DEMO_BILLING_TIER_ACCOUNTS,
  DEMO_MOCK_MEMBERS,
  DEMO_PASSWORD,
  SHOW_DEMO_ACCOUNTS,
} from "@/constants/demo-accounts";
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  emailSentPath,
  resolvePostLoginRedirect,
} from "@/constants/routes";
import { ApiError } from "@/lib/api/client";
import { clearBootSplashSeed } from "@/lib/auth/boot-splash-bridge";
import { loginSchema, type LoginFormValues } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";
import { resetAsymptoticProgressSingleton } from "@/hooks/use-asymptotic-progress";
import { useAuth } from "@/providers/auth-provider";

const welcomePoints = [
  {
    icon: HeartHandshake,
    title: "Bem-vindo de volta",
    description: "A semana da sua igreja, pronta pra você.",
    tone: "text-foreground bg-muted",
  },
  {
    icon: CalendarDays,
    title: "Próximo culto em vista",
    description: "Agenda, escalas e comunicados — tudo no mesmo lugar.",
    tone: "text-attention-foreground bg-attention-subtle",
  },
] as const;

function LoginFormContent() {
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIdentifier, setLoadingIdentifier] = useState<string | null>(
    null,
  );
  const [demoOpen, setDemoOpen] = useState(false);
  const passwordResetSuccess = searchParams.get("reset") === "success";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user) {
      return;
    }

    const destination = user.mustChangePassword
      ? AUTH_ROUTES.changePassword
      : resolvePostLoginRedirect(searchParams.get("redirect"));

    window.location.replace(destination);
  }, [isAuthenticated, isAuthLoading, user, searchParams]);

  async function performLogin(
    loginIdentifierValue: string,
    loginPassword: string,
  ) {
    clearErrors("root");
    setIsLoading(true);
    setLoadingIdentifier(loginIdentifierValue);

    try {
      const session = await login({
        identifier: loginIdentifierValue.trim(),
        password: loginPassword,
      });

      const destination = session.user.mustChangePassword
        ? AUTH_ROUTES.changePassword
        : resolvePostLoginRedirect(searchParams.get("redirect"));

      window.location.replace(destination);
    } catch (loginError) {
      if (
        loginError instanceof ApiError &&
        loginError.code === "EMAIL_VERIFICATION_REQUIRED"
      ) {
        const email =
          loginError.email?.trim().toLowerCase() ||
          (loginIdentifierValue.includes("@")
            ? loginIdentifierValue.trim().toLowerCase()
            : "");
        window.location.replace(emailSentPath(email, { from: "login" }));
        return;
      }

      setError("root", {
        message:
          loginError instanceof Error
            ? loginError.message
            : "Não foi possível entrar. Tente novamente.",
      });
      clearBootSplashSeed();
      resetAsymptoticProgressSingleton();
      setIsLoading(false);
      setLoadingIdentifier(null);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    await performLogin(values.identifier, values.password);
  });

  async function handleQuickLogin(loginEmail: string) {
    setValue("identifier", loginEmail);
    setValue("password", DEMO_PASSWORD);
    await performLogin(loginEmail, DEMO_PASSWORD);
  }

  if (isLoading) {
    return (
      <AuthBootSplash
        ready={false}
        label="Entrando na sua igreja…"
      />
    );
  }

  return (
    <motion.div
      className="relative w-full"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-popover backdrop-blur-sm lg:grid lg:min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <aside className="relative flex overflow-hidden border-b border-border/60 bg-gradient-to-br from-muted via-card to-attention-subtle px-6 py-8 sm:px-8 sm:py-10 lg:min-h-full lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div
            className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-domain-members/18 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-10 size-48 rounded-full bg-attention/22 blur-3xl"
            aria-hidden
          />

          <div className="relative my-auto space-y-6">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5" aria-hidden />
              A semana da sua igreja
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Que bom te ver de novo
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                Entre para ver o próximo culto, as escalas e o que ainda precisa
                da sua atenção.
              </p>
            </div>

            <ul className="space-y-3">
              {welcomePoints.map((item) => (
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
          </div>
        </aside>

        <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Entrar
            </h2>
            <p className="text-sm text-muted-foreground">
              Use o e-mail ou CPF da sua conta.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {passwordResetSuccess && (
              <FormAlert variant="success">
                Senha redefinida com sucesso. Faça login com sua nova senha.
              </FormAlert>
            )}

            {errors.root?.message && (
              <FormAlert>{errors.root.message}</FormAlert>
            )}

            <FormField
              label="E-mail ou CPF"
              htmlFor="identifier"
              error={errors.identifier?.message}
              required
            >
              <Input
                id="identifier"
                type="text"
                placeholder="pastor@igreja.com.br ou CPF"
                autoComplete="username"
                disabled={isLoading}
                aria-invalid={errors.identifier ? true : undefined}
                {...register("identifier")}
              />
            </FormField>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none text-foreground"
                >
                  Senha
                  <span className="ml-0.5 text-destructive" aria-hidden>
                    *
                  </span>
                </label>
                <Link
                  href={PUBLIC_ROUTES.forgotPassword}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {isLoading ? "Entrando..." : "Entrar na igreja"}
              {!isLoading && <ArrowRight className="size-4" aria-hidden />}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link
                href={PUBLIC_ROUTES.register}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Começar grátis
              </Link>
            </p>

            {SHOW_DEMO_ACCOUNTS && (
              <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                <button
                  type="button"
                  onClick={() => setDemoOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span>
                    <span className="block text-xs font-medium text-foreground">
                      Contas de teste
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Senha: <code className="text-foreground">{DEMO_PASSWORD}</code>
                    </span>
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {demoOpen ? "Ocultar" : "Mostrar"}
                  </span>
                </button>

                {demoOpen && (
                  <div className="mt-3 space-y-3">
                    <div className="grid gap-2">
                      {DEMO_ACCOUNTS.map((account) => (
                        <button
                          key={account.email}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickLogin(account.email)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                            loadingIdentifier === account.email && "opacity-70",
                          )}
                        >
                          <span className="font-medium">{account.label}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {account.email}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Faixas Stripe — trial expirado
                      </p>
                      <div className="mt-2 grid gap-2">
                        {DEMO_BILLING_TIER_ACCOUNTS.map((account) => (
                          <button
                            key={account.email}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleQuickLogin(account.email)}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                              loadingIdentifier === account.email &&
                                "opacity-70",
                            )}
                          >
                            <span className="font-medium">{account.label}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {account.email}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Membros mock — Batista Central
                      </p>
                      <div className="mt-2 grid max-h-44 gap-2 overflow-y-auto pr-1">
                        {DEMO_MOCK_MEMBERS.map((account) => (
                          <button
                            key={account.email}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleQuickLogin(account.email)}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                              loadingIdentifier === account.email &&
                                "opacity-70",
                            )}
                          >
                            <span className="font-medium">{account.label}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {account.email}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md rounded-2xl border-border/70 shadow-none">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Carregando...
          </CardContent>
        </Card>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
