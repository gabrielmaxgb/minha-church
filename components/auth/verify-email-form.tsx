"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-field";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { verifyEmailRequest } from "@/lib/api/auth";
import { useAuth } from "@/providers/auth-provider";

function VerifyEmailFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { reloadSession } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const attemptedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link inválido. Solicite um novo e-mail de verificação.");
      return;
    }

    if (attemptedTokenRef.current === token) {
      return;
    }

    attemptedTokenRef.current = token;

    let cancelled = false;

    async function verify() {
      try {
        const response = await verifyEmailRequest(token);

        if (!cancelled) {
          setStatus("success");
          setMessage(response.message);
        }

        try {
          await reloadSession();
        } catch {
          // Sessão pode não existir se o usuário abriu o link em outro dispositivo.
        }
      } catch (verifyError) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            verifyError instanceof Error
              ? verifyError.message
              : "Não foi possível confirmar seu e-mail.",
          );
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token, reloadSession]);

  return (
    <Card className="w-full max-w-md border-border shadow-none">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {status === "loading" ? (
            <Loader2 className="size-6 animate-spin" aria-hidden />
          ) : status === "success" ? (
            <CheckCircle2 className="size-6" aria-hidden />
          ) : (
            <XCircle className="size-6 text-destructive" aria-hidden />
          )}
        </div>
        <CardTitle className="font-display text-2xl">Verificar e-mail</CardTitle>
        <CardDescription>
          {status === "loading"
            ? "Confirmando seu endereço de e-mail..."
            : status === "success"
              ? "Tudo certo por aqui."
              : "Não foi possível concluir a verificação."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {message && (
          <FormAlert variant={status === "success" ? "success" : undefined}>
            {message}
          </FormAlert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {status === "success" && (
          <Button className="w-full" asChild>
            <Link href={AUTH_ROUTES.dashboard}>Ir para o painel</Link>
          </Button>
        )}
        {status === "error" && (
          <>
            <Button className="w-full" asChild>
              <Link href={AUTH_ROUTES.dashboard}>Ir para o painel</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href={PUBLIC_ROUTES.login}>Voltar ao login</Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export function VerifyEmailForm() {
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
      <VerifyEmailFormContent />
    </Suspense>
  );
}
