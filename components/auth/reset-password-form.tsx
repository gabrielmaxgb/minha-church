"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
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
import { PUBLIC_ROUTES } from "@/constants/routes";
import {
  resetPasswordRequest,
  validateResetTokenRequest,
} from "@/lib/api/auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validation/schemas";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      if (!token) {
        setTokenValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const response = await validateResetTokenRequest(token);
        if (!cancelled) {
          setTokenValid(response.valid);
        }
      } catch {
        if (!cancelled) {
          setTokenValid(false);
        }
      } finally {
        if (!cancelled) {
          setIsValidating(false);
        }
      }
    }

    void validate();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");
    setIsLoading(true);

    try {
      await resetPasswordRequest(token, values.newPassword);
      router.push(`${PUBLIC_ROUTES.login}?reset=success`);
    } catch (submitError) {
      setError("root", {
        message:
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível redefinir a senha.",
      });
    } finally {
      setIsLoading(false);
    }
  });

  if (isValidating) {
    return (
      <Card className="w-full max-w-md border-border shadow-none">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Validando link...
        </CardContent>
      </Card>
    );
  }

  if (!tokenValid) {
    return (
      <Card className="w-full max-w-md border-border shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Link inválido</CardTitle>
          <CardDescription>
            Este link expirou ou já foi utilizado. Solicite uma nova recuperação
            de senha.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href={PUBLIC_ROUTES.forgotPassword}>Solicitar novo link</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={PUBLIC_ROUTES.login}>Voltar ao login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Nova senha</CardTitle>
        <CardDescription>Defina uma nova senha para sua conta</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          {errors.root?.message && <FormAlert>{errors.root.message}</FormAlert>}

          <FormField
            label="Nova senha"
            htmlFor="newPassword"
            error={errors.newPassword?.message}
            required
          >
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isLoading}
                className="pr-10"
                aria-invalid={errors.newPassword ? true : undefined}
                {...register("newPassword")}
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
          </FormField>

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
                  showConfirmPassword ? "Ocultar confirmação" : "Exibir confirmação"
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
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Redefinir senha"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md border-border shadow-none">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Carregando...
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
