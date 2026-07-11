"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  PartyPopper,
  Sparkles,
  XCircle,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-field";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { verifyEmailRequest } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const successHighlights = [
  {
    icon: HeartHandshake,
    title: "Obrigado por confirmar",
    description: "Sua conta está pronta — a igreja já pode começar organizada.",
    tone: "text-domain-members-foreground bg-domain-members-subtle",
  },
  {
    icon: CalendarDays,
    title: "A semana te espera",
    description: "Membros, escalas e avisos no mesmo lugar, com calma.",
    tone: "text-domain-activities-foreground bg-domain-activities-subtle",
  },
  {
    icon: PartyPopper,
    title: "Bem-vindo de verdade",
    description: "Esse é o primeiro passo. O resto a gente simplifica juntos.",
    tone: "text-attention-foreground bg-attention-subtle",
  },
] as const;

function VerifyEmailFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { reloadSession, isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
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

  const panelTitle =
    status === "loading"
      ? "Quase lá..."
      : status === "success"
        ? "Seja bem-vindo"
        : "Ops, algo deu errado";

  const panelSubtitle =
    status === "loading"
      ? "Estamos confirmando seu e-mail. Só um instante."
      : status === "success"
        ? "Obrigado por fazer parte. Sua igreja acaba de ganhar um espaço mais leve e organizado."
        : "Não conseguimos confirmar esse link. Peça um novo e tente de novo.";

  const ctaHref = isAuthenticated
    ? AUTH_ROUTES.dashboard
    : PUBLIC_ROUTES.login;
  const ctaLabel = isAuthenticated ? "Ir para o painel" : "Entrar no painel";

  return (
    <motion.div
      className="relative w-full"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-popover backdrop-blur-sm lg:grid lg:min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <aside className="relative flex overflow-hidden border-b border-border/60 bg-gradient-to-br from-domain-members-subtle via-card to-domain-activities-subtle/80 px-6 py-8 sm:px-8 sm:py-10 lg:min-h-full lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div
            className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-domain-members/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-10 size-48 rounded-full bg-attention/20 blur-3xl"
            aria-hidden
          />

          <div className="relative my-auto space-y-6">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-domain-members/25 bg-domain-members-subtle px-3 py-1 text-xs font-medium text-domain-members-foreground">
              <Sparkles className="size-3.5" aria-hidden />
              {status === "success" ? "E-mail confirmado" : "Confirmação de e-mail"}
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {panelTitle}
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                {panelSubtitle}
              </p>
            </div>

            {status === "success" ? (
              <ul className="space-y-3">
                {successHighlights.map((item, index) => (
                  <motion.li
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/70 p-3"
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={
                      shouldReduceMotion ? undefined : { opacity: 1, x: 0 }
                    }
                    transition={{
                      delay: 0.12 + index * 0.08,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
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
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                {status === "loading"
                  ? "Isso costuma ser rápido — obrigado pela paciência."
                  : "Se o link expirou, peça outro no login e a gente te envia de novo."}
              </p>
            )}
          </div>
        </aside>

        <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">
          <div className="mb-6 flex flex-col items-start gap-4 sm:items-center sm:text-center lg:items-start lg:text-left">
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl",
                status === "loading" &&
                  "bg-domain-activities-subtle text-domain-activities-foreground",
                status === "success" &&
                  "bg-domain-members-subtle text-domain-members-foreground",
                status === "error" && "bg-destructive/10 text-destructive",
              )}
            >
              {status === "loading" ? (
                <Loader2 className="size-7 animate-spin" aria-hidden />
              ) : status === "success" ? (
                <CheckCircle2 className="size-7" aria-hidden />
              ) : (
                <XCircle className="size-7" aria-hidden />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {status === "loading"
                  ? "Confirmando e-mail"
                  : status === "success"
                    ? "Tudo certo — e obrigado!"
                    : "Não foi possível verificar"}
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {status === "loading"
                  ? "Estamos validando o link que você recebeu."
                  : status === "success"
                    ? "Sua conta está liberada. Entre e comece a organizar a semana da sua igreja com a gente."
                    : "O link pode ter expirado ou já ter sido usado. Volte ao login e peça um novo."}
              </p>
            </div>
          </div>

          {message && status !== "loading" && (
            <div className="mb-6">
              <FormAlert
                variant={status === "success" ? "success" : undefined}
              >
                {message}
              </FormAlert>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {status === "success" && (
              <Button className="w-full gap-2" size="lg" asChild>
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            )}
            {status === "error" && (
              <Button className="w-full" variant="outline" size="lg" asChild>
                <Link href={PUBLIC_ROUTES.login}>Voltar ao login</Link>
              </Button>
            )}
            {status === "loading" && (
              <p className="text-center text-sm text-muted-foreground lg:text-left">
                Aguarde um momento...
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function VerifyEmailForm() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border/70 bg-card/90 px-6 py-10 text-center text-sm text-muted-foreground shadow-popover">
          Carregando...
        </div>
      }
    >
      <VerifyEmailFormContent />
    </Suspense>
  );
}
