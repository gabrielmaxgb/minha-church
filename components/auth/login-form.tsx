"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

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
import {
  DEMO_ACCOUNTS,
  DEMO_MOCK_MEMBERS,
  DEMO_PASSWORD,
  SHOW_DEMO_ACCOUNTS,
} from "@/constants/demo-accounts";
import { PUBLIC_ROUTES, AUTH_ROUTES, resolvePostLoginRedirect } from "@/constants/routes";
import { loginSchema, type LoginFormValues } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIdentifier, setLoadingIdentifier] = useState<string | null>(null);
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

  async function performLogin(loginIdentifierValue: string, loginPassword: string) {
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
      setError("root", {
        message:
          loginError instanceof Error
            ? loginError.message
            : "Não foi possível entrar. Tente novamente.",
      });
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

  return (
    <Card className="w-full max-w-md border-border shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Entrar</CardTitle>
        <CardDescription>Acesse o painel da sua igreja</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          {passwordResetSuccess && (
            <FormAlert variant="success">
              Senha redefinida com sucesso. Faça login com sua nova senha.
            </FormAlert>
          )}

          {errors.root?.message && <FormAlert>{errors.root.message}</FormAlert>}

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
              Configure <code className="text-foreground">NEXT_PUBLIC_API_URL</code>{" "}
              no <code className="text-foreground">.env.local</code> apontando para
              o backend Nest.
            </p>
          )}

          {SHOW_DEMO_ACCOUNTS && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs font-medium text-foreground">
                Contas de teste
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Senha de todas: <code className="text-foreground">{DEMO_PASSWORD}</code>
              </p>

              <div className="mt-3 space-y-3">
                <div className="grid gap-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLogin(account.email)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
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
                          "flex w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
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
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
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
        </CardFooter>
      </form>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-sm border-border shadow-none">
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
