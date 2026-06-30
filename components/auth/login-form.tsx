"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  SHOW_DEMO_ACCOUNTS,
} from "@/constants/demo-accounts";
import { PUBLIC_ROUTES, resolvePostLoginRedirect } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function performLogin(loginEmail: string, loginPassword: string) {
    setError(null);
    setIsLoading(true);
    setLoadingEmail(loginEmail);

    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
      router.push(resolvePostLoginRedirect(searchParams.get("redirect")));
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
      setLoadingEmail(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    await performLogin(email, password);
  }

  async function handleQuickLogin(loginEmail: string) {
    setEmail(loginEmail);
    setPassword(DEMO_PASSWORD);
    await performLogin(loginEmail, DEMO_PASSWORD);
  }

  return (
    <Card className="w-full max-w-md border-border shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Entrar</CardTitle>
        <CardDescription>Acesse o painel da sua igreja</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="pastor@igreja.com.br"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="#"
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                required
                className="pr-10"
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

              <div className="mt-3 grid gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickLogin(account.email)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                      loadingEmail === account.email && "opacity-70",
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
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link
              href={PUBLIC_ROUTES.pricing}
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
