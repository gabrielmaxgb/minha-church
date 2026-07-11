"use client";

import { useState } from "react";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <div className="mb-6 rounded-xl border border-attention-border bg-attention-subtle px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-attention-mark text-attention-foreground">
            <MailCheck className="size-4" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Confirme seu e-mail para liberar todos os recursos
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Enviamos um link para <span className="font-medium text-foreground">{email}</span>.
              Confirme para concluir o cadastro da igreja e usar todos os recursos do painel.
            </p>
            {feedback && (
              <p className="text-sm text-success-foreground">{feedback}</p>
            )}
            {pendingHint && (
              <p className="text-sm leading-relaxed text-attention-foreground">
                {pendingHint}
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:shrink-0">
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
        </div>
      </div>
    </div>
  );
}
