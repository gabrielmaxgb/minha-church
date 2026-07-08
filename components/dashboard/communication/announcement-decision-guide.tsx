"use client";

import { useEffect, useId } from "react";
import { CalendarDays, HelpCircle, Megaphone, X } from "lucide-react";

interface AnnouncementDecisionGuideProps {
  open: boolean;
  onClose: () => void;
}

const EVENT_SIGNS = [
  "Acontece em data e horário específicos",
  "As pessoas precisam se organizar para estar lá",
  "Deve aparecer no calendário e em “próximos eventos”",
  "Vai ter escala ou confirmação de presença",
];

const ANNOUNCEMENT_SIGNS = [
  "É um recado, lembrete ou orientação",
  "Não tem um horário fixo para “acontecer”",
  "Precisa ser lido por um grupo ou pela igreja toda",
  "Vale para vários eventos ou nenhum evento específico",
];

export function AnnouncementDecisionGuide({
  open,
  onClose,
}: AnnouncementDecisionGuideProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-lg flex-col rounded-t-2xl border border-border bg-background shadow-2xl sm:max-h-[min(90dvh,640px)] sm:rounded-2xl"
      >
        <header className="flex items-start gap-3 px-6 pb-4 pt-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight">
              Comunicado ou evento?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Uma regra simples para escolher onde registrar cada coisa.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              Evento = entra na agenda. Comunicado = precisa ser lido.
            </p>
            <p className="mt-1 text-muted-foreground">
              Se for os dois, crie o evento e use o comunicado só para o aviso
              extra.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                <CalendarDays className="size-4" aria-hidden />
                <h3 className="text-sm font-semibold">Crie um evento</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {EVENT_SIGNS.map((sign) => (
                  <li
                    key={sign}
                    className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-500" />
                    {sign}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Megaphone className="size-4" aria-hidden />
                <h3 className="text-sm font-semibold">Crie um comunicado</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {ANNOUNCEMENT_SIGNS.map((sign) => (
                  <li
                    key={sign}
                    className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                    {sign}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <p className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Dica: se o aviso é só sobre um culto específico (tema da palavra,
            ceia, chegar mais cedo), use o <strong>Recado em destaque</strong>{" "}
            dentro do próprio evento, em vez de um comunicado separado.
          </p>
        </div>
      </div>
    </div>
  );
}
