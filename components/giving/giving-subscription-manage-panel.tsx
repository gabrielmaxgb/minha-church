"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { formatBrlFromCents } from "@/components/giving/giving-stripe";
import { givingFundPath, PUBLIC_ROUTES } from "@/constants/routes";
import {
  cancelPublicGivingSubscription,
  contactPublicGivingSubscription,
  fetchPublicGivingSubscription,
  type GivingSubscriptionContactReason,
  type PublicGivingSubscription,
} from "@/lib/api/payments";
import { toastApiError, toastError, toastSuccess } from "@/lib/ui/toast";

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  past_due: "Pagamento em atraso",
  canceled: "Cancelada",
  incomplete: "Incompleta",
};

const REASON_OPTIONS: Array<{
  value: GivingSubscriptionContactReason;
  label: string;
}> = [
  {
    value: "cancel_help",
    label: "Quero cancelar / preciso de ajuda para cancelar",
  },
  {
    value: "verify_cancel",
    label: "Cancelei e quero confirmar se deu certo",
  },
  { value: "other", label: "Outro assunto" },
];

export function GivingSubscriptionManagePanel({
  subscriptionId,
  token,
}: {
  subscriptionId: string;
  token: string;
}) {
  const [subscription, setSubscription] =
    useState<PublicGivingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const [reason, setReason] =
    useState<GivingSubscriptionContactReason>("cancel_help");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token.trim()) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const next = await fetchPublicGivingSubscription(subscriptionId, token);
        if (cancelled) return;
        setSubscription(next);
        setName(next.payerName ?? "");
        setReplyEmail(next.payerEmail ?? "");
      } catch {
        if (cancelled) return;
        setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [subscriptionId, token]);

  const handleCancel = async () => {
    if (!subscription) return;
    setCanceling(true);
    try {
      const next = await cancelPublicGivingSubscription(
        subscription.id,
        token,
      );
      setSubscription(next);
      toastSuccess("Contribuição mensal cancelada.");
    } catch (err) {
      toastApiError(err, "Não foi possível cancelar.");
    } finally {
      setCanceling(false);
    }
  };

  const handleContact = async () => {
    if (!subscription) return;
    if (message.trim().length < 10) {
      toastError("Escreva uma mensagem com pelo menos 10 caracteres.");
      return;
    }

    setContacting(true);
    try {
      await contactPublicGivingSubscription(subscription.id, token, {
        reason,
        message: message.trim(),
        name: name.trim() || undefined,
        replyEmail: replyEmail.trim() || undefined,
      });
      setContactSent(true);
      setMessage("");
      toastSuccess("Mensagem enviada à igreja.");
    } catch (err) {
      toastApiError(err, "Não foi possível enviar a mensagem.");
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Carregando contribuição…
      </div>
    );
  }

  if (notFound || !subscription) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h1 className="text-xl font-semibold tracking-tight">
          Link inválido ou expirado
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Não encontramos esta contribuição mensal. Se você ainda está sendo
          cobrado, fale com a igreja pelo contato do site ou do recibo.
        </p>
        <Button asChild variant="outline">
          <Link href={PUBLIC_ROUTES.home}>Voltar ao site</Link>
        </Button>
      </div>
    );
  }

  const isCanceled = subscription.status === "canceled";
  const fundHref = givingFundPath(
    subscription.churchSlug,
    subscription.fundSlug,
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Contribuição mensal
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {subscription.churchName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {subscription.fundName} ·{" "}
            {formatBrlFromCents(subscription.amountCents)}/mês
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm">
          <p>
            <span className="text-muted-foreground">Status: </span>
            <span className="font-medium text-foreground">
              {STATUS_LABEL[subscription.status] ?? subscription.status}
            </span>
          </p>
          {subscription.payerEmail ? (
            <p className="mt-1 text-muted-foreground">
              E-mail: {subscription.payerEmail}
            </p>
          ) : null}
          {isCanceled && subscription.canceledAt ? (
            <p className="mt-1 text-muted-foreground">
              Cancelada em{" "}
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
              }).format(new Date(subscription.canceledAt))}
            </p>
          ) : null}
        </div>

        {isCanceled ? (
          <div className="flex items-start gap-2 rounded-xl border border-success/30 bg-success-subtle px-4 py-3 text-sm text-success-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Esta contribuição mensal já está cancelada. Não haverá novas
              cobranças no cartão.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ao cancelar, paramos as próximas cobranças. O valor já pago neste
              mês não é estornado automaticamente.
            </p>
            <Button
              type="button"
              variant="destructive"
              disabled={canceling}
              onClick={() => void handleCancel()}
              className="w-full"
            >
              {canceling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Cancelar contribuição mensal
            </Button>
          </div>
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href={fundHref}>Voltar ao fundo</Link>
        </Button>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            <Mail className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Falar com a igreja
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Se não conseguir cancelar, quiser confirmar o cancelamento ou
              precisar de ajuda, envie uma mensagem ao responsável da igreja.
            </p>
          </div>
        </div>

        {contactSent ? (
          <div className="rounded-xl border border-success/30 bg-success-subtle px-4 py-3 text-sm text-success-foreground">
            Mensagem enviada. A igreja responde no e-mail que você informou.
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="contact-reason">Assunto</Label>
            <SelectField
              id="contact-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as GivingSubscriptionContactReason)
              }
              disabled={contacting}
            >
              {REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>

          <FormField label="Seu nome" htmlFor="contact-name">
            <Input
              id="contact-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={contacting}
              autoComplete="name"
            />
          </FormField>

          <FormField
            label="E-mail para resposta"
            htmlFor="contact-email"
            required
          >
            <Input
              id="contact-email"
              type="email"
              value={replyEmail}
              onChange={(event) => setReplyEmail(event.target.value)}
              disabled={contacting}
              autoComplete="email"
              required
            />
          </FormField>

          <FormField label="Mensagem" htmlFor="contact-message" required>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={contacting}
              rows={4}
              className="min-h-[110px] resize-y rounded-xl"
              placeholder="Ex.: Cancelei por este link e gostaria de confirmar se a cobrança parou."
            />
          </FormField>

          <Button
            type="button"
            className="w-full"
            disabled={contacting || message.trim().length < 10 || !replyEmail.trim()}
            onClick={() => void handleContact()}
          >
            {contacting ? <Loader2 className="size-4 animate-spin" /> : null}
            Enviar mensagem
          </Button>
        </div>
      </section>
    </div>
  );
}
