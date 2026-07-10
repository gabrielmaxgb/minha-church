"use client";

import { useEffect, useId } from "react";
import {
  CalendarDays,
  ClipboardList,
  HelpCircle,
  Shield,
  UserCog,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface MinistryRolesGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function MinistryRolesGuideModal({
  open,
  onClose,
}: MinistryRolesGuideModalProps) {
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
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-lg flex-col rounded-t-xl border border-border bg-background shadow-popover sm:max-h-[min(90dvh,680px)] sm:rounded-xl"
      >
        <header className="flex items-start gap-3 px-6 pb-4 pt-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-lg font-semibold tracking-tight"
            >
              Cargos e funções no ministério
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dois conceitos diferentes — confundir os dois é o erro mais comum
              na configuração.
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
          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-xl border border-border/70 bg-muted/15 p-4">
              <div className="flex items-center gap-2 text-foreground">
                <Shield className="size-4" aria-hidden />
                <h3 className="text-sm font-semibold">Cargo de liderança</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Papel <strong className="text-foreground">administrativo</strong>{" "}
                no ministério. Define quem pode gerenciar eventos e montar a
                escala.
              </p>
              <p className="mt-2 text-xs font-medium text-foreground">
                Ex.: Líder, Coordenador, Auxiliar
              </p>
            </section>

            <section className="rounded-xl border border-border/70 bg-muted/15 p-4">
              <div className="flex items-center gap-2 text-foreground">
                <ClipboardList className="size-4" aria-hidden />
                <h3 className="text-sm font-semibold">Função na escala</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Tarefa em que a pessoa{" "}
                <strong className="text-foreground">
                  serve no ministério ou grupo de serviço que você criou
                </strong>
                . Usada na disponibilidade e na montagem da escala.
              </p>
              <p className="mt-2 text-xs font-medium text-foreground">
                Ex.: Recepção, Infantil, Mídia, Hospitalidade
              </p>
            </section>
          </div>

          <section className="rounded-xl border border-border/70 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-foreground">
              <UserCog className="size-4" aria-hidden />
              <h3 className="text-sm font-semibold">Quem define e quem recebe</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span>
                  <strong className="text-foreground">Cargos</strong> são criados
                  aqui e atribuídos na aba Membros pelo líder do ministério.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                <span>
                  <strong className="text-foreground">Funções</strong> são
                  definidas em Funções na escala; cada membro escolhe no perfil
                  em quais pode atuar.
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/70 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-foreground">
              <CalendarDays className="size-4" aria-hidden />
              <h3 className="text-sm font-semibold">Regra prática</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Se a palavra descreve{" "}
              <strong className="text-foreground">
                o que a pessoa faz no ministério ou grupo de serviço
              </strong>{" "}
              (mídia, recepção, infantil…), é função. Se descreve{" "}
              <strong className="text-foreground">quem lidera ou administra</strong>,
              é cargo.
            </p>
          </section>

          <p className="rounded-xl border border-attention-border bg-attention-subtle px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Não crie</strong> Vocal, Teclado ou
            Mídia como cargo — isso vai para Funções na escala.
          </p>
        </div>

        <footer className="border-t border-border/70 px-6 py-4">
          <Button type="button" className="w-full" onClick={onClose}>
            Entendi
          </Button>
        </footer>
      </div>
    </div>
  );
}
