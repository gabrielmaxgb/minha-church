"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  fetchGivingDonationReceipt,
  type GivingDonationOutcome,
  type GivingDonationReceipt,
} from "@/lib/api/payments";
import { formatBrlFromCents } from "@/components/giving/giving-stripe";

const POLL_MS = 1_500;
const POLL_ATTEMPTS = 6;

type Copy = {
  eyebrow: string;
  title: string;
  body: string;
  icon: "success" | "processing" | "incomplete" | "failed";
};

function copyForOutcome(
  outcome: GivingDonationOutcome,
  receipt: GivingDonationReceipt | null,
): Copy {
  const amountLabel =
    receipt != null ? formatBrlFromCents(receipt.amountCents) : null;
  const fundLabel = receipt?.fundName;

  switch (outcome) {
    case "succeeded":
      return {
        eyebrow: "Contribuição",
        title: "Obrigado pela contribuição",
        body: amountLabel
          ? `${amountLabel}${fundLabel ? ` para ${fundLabel}` : ""} já está confirmado${fundLabel ? " e registrado no fundo" : ""}.`
          : "Seu pagamento foi confirmado e registrado no fundo.",
        icon: "success",
      };
    case "processing":
      return {
        eyebrow: "Aguardando pagamento",
        title: "Contribuição iniciada",
        body: amountLabel
          ? `${amountLabel}${fundLabel ? ` para ${fundLabel}` : ""} ainda não caiu. Quase sempre isso acontece com boleto ou Pix em análise — o fundo só contabiliza depois da confirmação.`
          : "O pagamento ainda não foi confirmado. O fundo só contabiliza depois da confirmação.",
        icon: "processing",
      };
    case "failed":
      return {
        eyebrow: "Pagamento",
        title: "Não concluído",
        body: "Nada foi cobrado nesta tentativa. Você pode voltar e tentar de novo.",
        icon: "failed",
      };
    case "incomplete":
    default:
      return {
        eyebrow: "Pagamento",
        title: "Pagamento não confirmado",
        body: "Não encontramos confirmação desta contribuição. Se você saiu antes de pagar, nada foi cobrado.",
        icon: "incomplete",
      };
  }
}

function OutcomeIcon({ kind }: { kind: Copy["icon"] }) {
  const className = "size-6";
  switch (kind) {
    case "success":
      return (
        <CheckCircle2
          className={`${className} text-[var(--giving-trust)]`}
          aria-hidden
        />
      );
    case "processing":
      return <Clock3 className={`${className} text-amber-300`} aria-hidden />;
    case "failed":
      return <XCircle className={`${className} text-red-300`} aria-hidden />;
    case "incomplete":
    default:
      return (
        <AlertCircle className={`${className} text-[var(--giving-paper)]/70`} aria-hidden />
      );
  }
}

export function GivingThanksPanel({
  donationId,
  backHref,
  backLabel,
  retryHref,
  retryLabel,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: {
  donationId: string | null | undefined;
  backHref: string;
  backLabel: string;
  retryHref?: string;
  retryLabel?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}) {
  const [receipt, setReceipt] = useState<GivingDonationReceipt | null>(null);
  const [outcome, setOutcome] = useState<GivingDonationOutcome | null>(
    donationId ? null : "incomplete",
  );
  const [loading, setLoading] = useState(Boolean(donationId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!donationId) {
      setOutcome("incomplete");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const load = async () => {
      try {
        const next = await fetchGivingDonationReceipt(donationId);
        if (cancelled) return;

        setReceipt(next);
        setError(null);

        if (
          next.outcome === "incomplete" &&
          attempts < POLL_ATTEMPTS &&
          next.status === "pending"
        ) {
          attempts += 1;
          window.setTimeout(() => {
            void load();
          }, POLL_MS);
          return;
        }

        setOutcome(next.outcome);
        setLoading(false);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Não foi possível confirmar o pagamento.",
        );
        setOutcome("incomplete");
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [donationId]);

  const resolvedOutcome = outcome ?? "incomplete";
  const copy = copyForOutcome(resolvedOutcome, receipt);
  const showRetry =
    (resolvedOutcome === "incomplete" || resolvedOutcome === "failed") &&
    retryHref &&
    retryLabel;
  const showPrimary =
    resolvedOutcome === "succeeded" && primaryHref && primaryLabel;
  const showSecondary =
    resolvedOutcome === "succeeded" && secondaryHref && secondaryLabel;

  return (
    <div
      className={
        className ??
        "overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
      }
    >
      <div className="relative overflow-hidden bg-[var(--giving-ink)] px-7 py-10 text-[var(--giving-paper)] sm:px-9 sm:py-12">
        <div className="giving-grain" aria-hidden />
        <p className="text-xs font-medium tracking-wide text-[var(--giving-paper)]/50 uppercase">
          {copy.eyebrow}
        </p>

        {loading ? (
          <>
            <div className="mt-6 flex size-12 items-center justify-center rounded-2xl bg-[var(--giving-paper)]/10">
              <Loader2
                className="size-6 animate-spin text-[var(--giving-paper)]/70"
                aria-hidden
              />
            </div>
            <h2 className="font-display mt-5 text-2xl font-bold tracking-tight">
              Confirmando pagamento…
            </h2>
            <div className="mt-6 h-px w-12 bg-[var(--giving-trust)]" />
            <p className="mt-6 text-sm leading-relaxed text-[var(--giving-paper)]/70">
              Estamos conferindo o status real da contribuição com o processador
              de pagamento.
            </p>
          </>
        ) : (
          <>
            <div className="mt-6 flex size-12 items-center justify-center rounded-2xl bg-[var(--giving-paper)]/10">
              <OutcomeIcon kind={copy.icon} />
            </div>
            <h2 className="font-display mt-5 text-2xl font-bold tracking-tight">
              {copy.title}
            </h2>
            <div className="mt-6 h-px w-12 bg-[var(--giving-trust)]" />
            <p className="mt-6 text-sm leading-relaxed text-[var(--giving-paper)]/70">
              {error ?? copy.body}
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col gap-3 px-7 py-6 sm:px-9">
        {showPrimary ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
        ) : null}
        {showSecondary ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
        {showRetry ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={retryHref}>{retryLabel}</Link>
          </Button>
        ) : null}
        <Button
          asChild
          variant={showPrimary || showRetry || showSecondary ? "outline" : "default"}
          className="w-full sm:w-auto"
        >
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
