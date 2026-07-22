"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";

import { StripeBrandInline } from "@/components/brand/stripe-mark";
import {
  GivingShell,
  GivingTrustFooter,
} from "@/components/giving/giving-shell";
import {
  formatBrlFromCents,
  getGivingStripe,
  STRIPE_ELEMENTS_APPEARANCE,
  STRIPE_ELEMENTS_FONTS,
} from "@/components/giving/giving-stripe";
import { Button } from "@/components/ui/button";
import { activityDetailPath } from "@/constants/routes";
import { ApiError } from "@/lib/api/client";
import {
  createEventTicketCheckout,
  type GivingCheckoutSession,
} from "@/lib/api/payments";
import { eventsKeys, registerForFreeEvent } from "@/lib/api/queries/events.keys";
import { eventRegistrationCopy } from "@/lib/events/member-response-copy";
import { resolveGivingStripeError } from "@/lib/payments/giving-stripe-errors";
import { toastApiError, toastError } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEventDetail } from "@/types/events";

import "@/app/doar/giving.css";

const TICKET_PAID_QUERY = "inscricao";

type TicketStatus = NonNullable<ChurchEventDetail["myTicketStatus"]>;

export function EventTicketCheckout({
  eventId,
  priceCents,
  eventName,
  myTicketStatus = null,
  dense = false,
  flush = false,
}: {
  eventId: string;
  /** null/0 = inscrição gratuita (sem Stripe). */
  priceCents: number | null;
  eventName: string;
  myTicketStatus?: TicketStatus | null;
  dense?: boolean;
  /** Sem borda/sombra própria — usar dentro de um painel maior. */
  flush?: boolean;
}) {
  const { church, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const justPaid = searchParams.get(TICKET_PAID_QUERY) === "ok";
  const isPaid = Boolean(priceCents != null && priceCents >= 500);

  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<GivingCheckoutSession | null>(null);
  const [starting, setStarting] = useState(false);
  const [localStatus, setLocalStatus] = useState<TicketStatus | null>(null);

  const status = localStatus ?? myTicketStatus ?? (justPaid ? "succeeded" : null);

  const brand = {
    churchName: church?.name ?? "Sua igreja",
    fundName: eventName,
    fundDescription: isPaid
      ? eventRegistrationCopy.paymentDescription
      : eventRegistrationCopy.paymentDescriptionFree,
    eyebrow: eventRegistrationCopy.paymentEyebrow,
  };

  useEffect(() => {
    if (!justPaid || !church?.id) {
      return;
    }
    void queryClient.invalidateQueries({
      queryKey: eventsKeys.detail(church.id, eventId).queryKey,
    });
    void queryClient.invalidateQueries({
      queryKey: eventsKeys.ticketRegistrations(church.id, eventId).queryKey,
    });
  }, [justPaid, church?.id, eventId, queryClient]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setSession(null);
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const invalidateTicketQueries = () => {
    if (!church?.id) {
      return;
    }
    void queryClient.invalidateQueries({
      queryKey: eventsKeys.detail(church.id, eventId).queryKey,
    });
    void queryClient.invalidateQueries({
      queryKey: eventsKeys.ticketRegistrations(church.id, eventId).queryKey,
    });
  };

  const handleStart = async () => {
    if (!church?.id) {
      return;
    }

    setStarting(true);
    try {
      if (!isPaid) {
        await registerForFreeEvent(church.id, eventId);
        setLocalStatus("succeeded");
        invalidateTicketQueries();
        return;
      }

      const next = await createEventTicketCheckout(church.id, eventId);
      setSession(next);
      setLocalStatus("pending");
      setOpen(true);
      invalidateTicketQueries();
    } catch (startError) {
      if (startError instanceof ApiError && startError.status === 409) {
        setLocalStatus("succeeded");
        invalidateTicketQueries();
        return;
      }
      toastApiError(
        startError,
        isPaid
          ? "Não foi possível iniciar o pagamento da inscrição."
          : "Não foi possível confirmar a inscrição.",
      );
    } finally {
      setStarting(false);
    }
  };

  const dismissPaidBanner = () => {
    router.replace(pathname, { scroll: false });
  };

  if (status === "succeeded" && !open) {
    return (
      <TicketStatusCard
        tone="success"
        title={eventRegistrationCopy.confirmedTitle}
        description={
          dense
            ? isPaid
              ? eventRegistrationCopy.confirmedPaidDense
              : eventRegistrationCopy.confirmedFreeDense
            : isPaid
              ? eventRegistrationCopy.confirmedPaid
              : eventRegistrationCopy.confirmedFree
        }
        amountCents={isPaid ? priceCents : null}
        dense={dense}
        flush={flush}
        action={
          justPaid ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={dismissPaidBanner}
            >
              Fechar
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <>
      {!open ? (
        status === "pending" && isPaid ? (
          <TicketStatusCard
            tone="pending"
            title="Pagamento em andamento"
            description={
              dense
                ? "Aguardando confirmação. Você pode retomar o pagamento."
                : "Estamos aguardando a confirmação do pagamento (Pix ou boleto). Se fechou a tela, você pode retomar abaixo."
            }
            amountCents={priceCents}
            dense={dense}
            flush={flush}
            action={
              <div className="space-y-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 sm:w-auto"
                  disabled={starting}
                  onClick={() => void handleStart()}
                >
                  {starting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Retomar pagamento
                </Button>
              </div>
            }
          />
        ) : (
          <div
            className={cn(
              "overflow-hidden",
              !flush && "rounded-2xl border border-border bg-card shadow-xs",
              dense && "h-full",
            )}
          >
            <div
              className={cn(
                "flex items-start gap-3",
                dense ? "px-4 py-3.5" : "border-b border-border/70 px-4 py-4 sm:px-5",
                flush && !dense && "px-4 py-4 sm:px-5",
              )}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-domain-finances-subtle text-domain-finances-foreground">
                <Ticket className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {eventRegistrationCopy.eyebrow}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                      {isPaid
                        ? eventRegistrationCopy.titlePaid
                        : eventRegistrationCopy.titleFree}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums tracking-tight text-foreground">
                    {isPaid && priceCents != null
                      ? formatBrlFromCents(priceCents)
                      : "Gratuita"}
                  </p>
                </div>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                  {dense
                    ? isPaid
                      ? eventRegistrationCopy.subtitlePaidDense
                      : eventRegistrationCopy.subtitleFreeDense
                    : isPaid
                      ? eventRegistrationCopy.subtitlePaid
                      : eventRegistrationCopy.subtitleFree}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 w-full gap-2 sm:w-auto"
                  disabled={starting}
                  onClick={() => void handleStart()}
                >
                  {starting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isPaid && priceCents != null
                    ? eventRegistrationCopy.confirmPaid(
                        formatBrlFromCents(priceCents),
                      )
                    : eventRegistrationCopy.confirmFree}
                </Button>
              </div>
            </div>
          </div>
        )
      ) : null}

      {open && session ? (
        <div className="giving-root fixed inset-0 z-50 overflow-y-auto">
          <div className="relative mx-auto flex min-h-full w-full items-start justify-center px-4 py-8 sm:items-center sm:px-6 sm:py-12">
            <button
              type="button"
              className="absolute inset-0 bg-[var(--giving-ink)]/45 backdrop-blur-[2px]"
              aria-label="Fechar"
              onClick={handleClose}
            />

            <div className="relative z-10 w-full max-w-5xl">
              <div className="mb-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-[var(--giving-paper)]/20 bg-[var(--giving-ink)]/40 text-[var(--giving-paper)] hover:bg-[var(--giving-ink)]/60 hover:text-[var(--giving-paper)]"
                  onClick={handleClose}
                >
                  <X className="size-3.5" />
                  Fechar
                </Button>
              </div>

              <EventTicketPaymentStep
                brand={brand}
                eventName={eventName}
                session={session}
                memberName={user?.name ?? null}
                returnPath={activityDetailPath(eventId)}
                onBack={handleClose}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TicketStatusCard({
  tone,
  title,
  description,
  amountCents,
  action,
  dense = false,
  flush = false,
}: {
  tone: "success" | "pending";
  title: string;
  description: string;
  amountCents: number | null;
  action?: ReactNode;
  dense?: boolean;
  flush?: boolean;
}) {
  const Icon = tone === "success" ? CheckCircle2 : Clock3;
  return (
    <div
      className={cn(
        "flex h-full items-start gap-3",
        dense ? "px-4 py-3.5" : "px-4 py-4 sm:px-5",
        !flush && "rounded-2xl border",
        tone === "success"
          ? flush
            ? "bg-emerald-500/5"
            : "border-emerald-500/20 bg-emerald-500/5"
          : flush
            ? "bg-amber-500/5"
            : "border-amber-500/20 bg-amber-500/5",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          tone === "success" ? "text-emerald-700" : "text-amber-700",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </p>
          <p className="text-sm font-medium tabular-nums text-muted-foreground">
            {amountCents != null && amountCents > 0
              ? formatBrlFromCents(amountCents)
              : "Gratuita"}
          </p>
        </div>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}

function EventTicketPaymentStep({
  brand,
  eventName,
  session,
  memberName,
  returnPath,
  onBack,
}: {
  brand: {
    churchName: string;
    fundName: string;
    fundDescription?: string | null;
    eyebrow?: string;
  };
  eventName: string;
  session: GivingCheckoutSession;
  memberName: string | null;
  returnPath: string;
  onBack: () => void;
}) {
  const stripePromise = useMemo(
    () => getGivingStripe(session.publishableKey, session.stripeAccountId),
    [session.publishableKey, session.stripeAccountId],
  );

  return (
    <GivingShell
      brand={brand}
      brandExtra={
        <div className="mt-8 space-y-3">
          <div className="rounded-xl border border-[var(--giving-paper)]/15 bg-[var(--giving-paper)]/5 px-4 py-3">
            <p className="text-xs tracking-wide text-[var(--giving-paper)]/55 uppercase">
              Valor da inscrição
            </p>
            <p className="font-display mt-1 text-2xl font-bold tracking-tight">
              {formatBrlFromCents(session.amountCents)}
            </p>
          </div>
          {memberName ? (
            <div className="rounded-xl border border-[var(--giving-paper)]/15 bg-[var(--giving-paper)]/5 px-4 py-3">
              <p className="text-xs tracking-wide text-[var(--giving-paper)]/55 uppercase">
                Registrado como
              </p>
              <p className="mt-1 text-sm font-medium tracking-tight">
                {memberName}
              </p>
            </div>
          ) : null}
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={onBack}
          >
            Cancelar
          </button>
          <h2 className="mt-3 text-lg font-semibold tracking-tight">
            Forma de pagamento
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {eventName} · {formatBrlFromCents(session.amountCents)}
          </p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: session.clientSecret,
            fonts: [...STRIPE_ELEMENTS_FONTS],
            appearance: STRIPE_ELEMENTS_APPEARANCE,
            locale: "pt-BR",
          }}
        >
          <EventTicketConfirmForm
            returnPath={returnPath}
            ticketId={session.donationId}
          />
        </Elements>

        <div className="flex items-start gap-3 text-muted-foreground lg:hidden">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--giving-trust)]" />
          <p className="text-xs leading-relaxed">
            Dados do cartão tratados pelo <StripeBrandInline />. A cobrança vai
            para a conta da igreja.
          </p>
        </div>

        <GivingTrustFooter />
      </div>
    </GivingShell>
  );
}

function EventTicketConfirmForm({
  returnPath,
  ticketId,
}: {
  returnPath: string;
  ticketId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);

    const returnUrl = `${window.location.origin}${returnPath}?${TICKET_PAID_QUERY}=ok&ticketId=${encodeURIComponent(ticketId)}`;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (result.error) {
      toastError(resolveGivingStripeError(result.error));
      setSubmitting(false);
      return;
    }

    window.location.assign(returnUrl);
  };

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <Button
        type="button"
        className="w-full gap-2"
        disabled={!stripe || !elements || submitting}
        onClick={() => void handlePay()}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Confirmar inscrição
      </Button>
    </div>
  );
}
