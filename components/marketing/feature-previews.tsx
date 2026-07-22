"use client";

import {
  AlertCircle,
  Check,
  ChevronRight,
  Globe,
  HandHeart,
  Heart,
  Layers,
  Link2,
  Lock,
  Pin,
  QrCode,
} from "lucide-react";

import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";

/**
 * Previews de marketing — mesmos shells/tokens dos blocos reais do painel.
 * Sem chrome de browser inventado.
 */

/** Espelha ScheduleBanner (pendente) + lista de Minhas escalas. */
export function SchedulesFeaturePreview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden>
      <div className={pendingNotificationStyles.banner.interactive}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-xs">
              <AlertCircle className="size-6" />
            </div>
            <div className="min-w-0">
              <p className={pendingNotificationStyles.label}>
                Escalas aguardando resposta
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Diga se pode servir na escala
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                2 eventos aguardando sua resposta sobre servir na equipe.
              </p>
            </div>
          </div>
          <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Responder agora
            <ChevronRight className="size-4" />
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        {(
          [
            {
              name: "Louvor",
              summary: "2 respostas pendentes · 1 escala à frente",
              pending: 2,
            },
            {
              name: "Recepção",
              summary: "Nenhuma pendência · próxima escala no domingo",
              pending: 0,
            },
          ] as const
        ).map((ministry, index, list) => (
          <div
            key={ministry.name}
            className={cn(
              "flex items-center gap-3 px-4 py-4",
              index < list.length - 1 && "border-b border-border",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              <Layers className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-sm font-semibold tracking-tight text-foreground">
                  {ministry.name}
                </p>
                {ministry.pending > 0 ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs",
                      pendingNotificationStyles.badge,
                    )}
                  >
                    {ministry.pending} pendentes
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {ministry.summary}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Espelha FundCard (giving-funds-panel). */
export function FinancesFeaturePreview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden>
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-domain-finances/25 bg-card shadow-xs">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-domain-finances-subtle/80 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-domain-finances-subtle text-domain-finances-foreground">
              <Link2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Dízimos e ofertas
              </h4>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                Contribuição geral da igreja — Pix, cartão e boleto.
              </p>
            </div>
          </div>

          <div className="mt-auto space-y-2.5">
            <span className="text-xs text-muted-foreground">
              Pix · Cartão · Boleto
            </span>
            <p className="truncate rounded-lg bg-foreground/4 px-2.5 py-1.5 font-mono text-[11px] tracking-tight text-muted-foreground">
              /doar/igreja-exemplo/dizimos
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground">
              <Check className="size-3.5" />
              Copiar link
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground">
              <QrCode className="size-3.5" />
              QR code
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-muted/60 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 flex items-start gap-3 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Lock className="size-5" />
          </span>
          <div className="min-w-0">
            <h4 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Construção do templo
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Só para membros · Pix
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Espelha AnnouncementCard. */
export function CommunicationFeaturePreview({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden>
      <article className="relative rounded-2xl border border-domain-communication/25 bg-domain-communication-subtle/40 p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-domain-communication-subtle px-2 py-0.5 text-[11px] font-medium text-domain-communication-foreground">
            <Pin className="size-3" />
            Fixado
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-attention-border bg-attention-subtle px-2 py-0.5 text-[11px] font-medium text-attention-foreground">
            Importante
          </span>
        </div>

        <h3 className="mt-2 text-base font-semibold tracking-tight text-foreground">
          Ensaio de louvor — quinta, 20h
        </h3>

        <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-domain-communication-subtle px-2.5 py-0.5 text-[11px] font-medium text-domain-communication-foreground">
          <Globe className="size-3 shrink-0" />
          <span className="truncate">Igreja inteira</span>
        </p>

        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          Confirmem presença no ensaio. Levem o repertório atualizado.
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>22 jul. 2026, 14:30</span>
          <span aria-hidden>·</span>
          <span>Pr. Marcos</span>
          <span aria-hidden>·</span>
          <span>18 leituras</span>
        </div>
      </article>

      <article className="relative rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Escala do domingo publicada
        </h3>
        <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Layers className="size-3 shrink-0" />
          <span className="truncate">Louvor</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Confira sua função e responda a disponibilidade.
        </p>
        <div className="mt-3.5 text-xs text-muted-foreground">
          21 jul. 2026, 09:12 · 11 leituras
        </div>
      </article>
    </div>
  );
}

/** Espelha PrayerRequestCard. */
export function CareFeaturePreview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden>
      <article className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tracking-wide text-foreground">
            AS
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Ana Silva
              </p>
              <time className="mt-0.5 block text-xs text-muted-foreground">
                há 1 dia
              </time>
            </div>
            <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground">
              Peço oração pela saúde da tia Marina — exames na próxima semana.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-xs">
                <HandHeart className="size-4" />
                Orar
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                12 pessoas orando
              </span>
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-domain-communication-subtle text-domain-communication-foreground">
            <HandHeart className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Anônimo
              </p>
              <time className="mt-0.5 block text-xs text-muted-foreground">
                há 3 dias
              </time>
            </div>
            <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground">
              Direção e paz para a família Santos neste momento.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-3 text-sm font-medium text-destructive shadow-xs">
                <Heart className="size-4 fill-current" />
                Estou orando
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                8 pessoas orando
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
