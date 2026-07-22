"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowRight,
  HeartHandshake,
  Inbox,
  MailCheck,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { resendVerificationEmailRequest } from "@/lib/api/auth";
import { toastApiError, toastSuccess } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: Inbox,
    title: "Olhe a caixa de entrada",
    description: "O link de confirmação já foi enviado. Abra o e-mail e clique nele.",
    tone: "text-foreground bg-muted",
  },
  {
    icon: HeartHandshake,
    title: "Obrigado por chegar até aqui",
    description: "Esse passo protege sua igreja e libera o painel com segurança.",
    tone: "text-muted-foreground bg-muted/80",
  },
  {
    icon: PartyPopper,
    title: "Depois é só entrar",
    description: "Com o e-mail confirmado, a semana da igreja fica pronta pra você.",
    tone: "text-attention-foreground bg-attention-subtle",
  },
] as const;

function EmailSentFormContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const from = searchParams.get("from");
  const isFromRegister = from === "register";
  const shouldReduceMotion = useReducedMotion();
  const [isResending, setIsResending] = useState(false);

  async function handleResend() {
    if (!email) {
      return;
    }

    setIsResending(true);

    try {
      const response = await resendVerificationEmailRequest(email);
      toastSuccess(response.message);
    } catch (resendError) {
      toastApiError(resendError, "Não foi possível reenviar o e-mail.");
    } finally {
      setIsResending(false);
    }
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
              {isFromRegister ? "Bem-vindo ao MinhaChurch" : "Só falta confirmar"}
            </p>

            <div className="space-y-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {isFromRegister ? "Que bom ter você aqui" : "Quase lá — obrigado"}
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                {isFromRegister
                  ? "Sua igreja já está a caminho. Confirmamos o e-mail e o painel fica liberado pra você organizar a semana com calma."
                  : "Antes de entrar, confirme o e-mail. É rápido — e depois a semana da sua igreja te espera no painel."}
              </p>
            </div>

            <ul className="space-y-3">
              {highlights.map((item, index) => (
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
          </div>
        </aside>

        <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">
          <div className="mb-6 flex flex-col items-start gap-4 sm:items-center sm:text-center lg:items-start lg:text-left">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-domain-members-subtle text-domain-members-foreground">
              <MailCheck className="size-7" aria-hidden />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                E-mail enviado
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {email ? (
                  <>
                    Enviamos um link de confirmação para{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                    Abra a mensagem e confirme — depois é só entrar.
                  </>
                ) : (
                  <>
                    Enviamos um link de confirmação para o e-mail da sua conta.
                    Confirme antes de entrar no painel.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {email ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={isResending}
                onClick={() => void handleResend()}
              >
                {isResending ? "Reenviando..." : "Reenviar link"}
              </Button>
            ) : null}

            <Button className="w-full gap-2" size="lg" asChild>
              <Link href={PUBLIC_ROUTES.login}>
                Já confirmei — entrar
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>

            <p className="text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
              Não achou o e-mail? Confira o spam ou a pasta de promoções. O link
              costuma chegar em poucos minutos.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function EmailSentForm() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border/70 bg-card/90 px-6 py-10 text-center text-sm text-muted-foreground shadow-popover">
          Carregando...
        </div>
      }
    >
      <EmailSentFormContent />
    </Suspense>
  );
}
