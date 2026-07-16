"use client";

import { useState } from "react";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardBanner } from "@/components/ui/dashboard-banner";
import { resendVerificationEmailRequest } from "@/lib/api/auth";
import { useAuth } from "@/providers/auth-provider";

export function EmailVerificationBanner() {
  const { user, reloadSession } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingHint, setPendingHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user?.isOwner || user.emailVerified !== false) {
    return null;
  }

  const email = user.email;

  async function handleResend() {
    setIsSending(true);
    setFeedback(null);
    setPendingHint(null);
    setError(null);

    try {
      const response = await resendVerificationEmailRequest(email);
      setFeedback(response.message);
      await reloadSession();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível reenviar o e-mail.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleRefreshStatus() {
    setIsRefreshing(true);
    setError(null);
    setFeedback(null);
    setPendingHint(null);

    try {
      const session = await reloadSession();

      if (session.user.emailVerified === false) {
        setPendingHint(
          "Ainda não encontramos a confirmação. Abra o link que enviamos para seu e-mail — se já clicou, aguarde alguns segundos e tente de novo, ou peça um novo envio.",
        );
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível atualizar o status. Tente novamente.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <DashboardBanner
      tone="attention"
      icon={MailCheck}
      label="E-mail"
      title="Confirme seu e-mail para liberar todos os recursos"
      description={
        <>
          Enviamos um link para{" "}
          <span className="font-medium text-foreground">{email}</span>. Confirme
          para concluir o cadastro da igreja e usar todos os recursos do painel.
          {feedback ? (
            <p className="mt-1 text-success-foreground">{feedback}</p>
          ) : null}
          {pendingHint ? (
            <p className="mt-1 text-attention-foreground">{pendingHint}</p>
          ) : null}
          {error ? <p className="mt-1 text-destructive">{error}</p> : null}
        </>
      }
      action={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-attention-border bg-card"
            disabled={isSending || isRefreshing}
            onClick={() => void handleResend()}
          >
            {isSending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Reenviar link
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSending || isRefreshing}
            onClick={() => void handleRefreshStatus()}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar status"
            )}
          </Button>
        </>
      }
    />
  );
}
