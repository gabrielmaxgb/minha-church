"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { forgotPasswordRequest } from "@/lib/api/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validation/schemas";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
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
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await forgotPasswordRequest(values.identifier.trim());
      setSuccessMessage(response.message);
    } catch (submitError) {
      setError("root", {
        message:
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível enviar a solicitação. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Card className="w-full max-w-md border-border shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Recuperar senha</CardTitle>
        <CardDescription>
          Informe o e-mail ou CPF usado no login. Se você tem e-mail cadastrado,
          enviaremos um link. Caso contrário, sua igreja será notificada.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          {errors.root?.message && <FormAlert>{errors.root.message}</FormAlert>}

          {successMessage && (
            <FormAlert variant="success">{successMessage}</FormAlert>
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
              disabled={isLoading || Boolean(successMessage)}
              aria-invalid={errors.identifier ? true : undefined}
              {...register("identifier")}
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || Boolean(successMessage)}
          >
            {isLoading ? "Enviando..." : "Enviar instruções"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Lembrou a senha?{" "}
            <Link
              href={PUBLIC_ROUTES.login}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Voltar ao login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
