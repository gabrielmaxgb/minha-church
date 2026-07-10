"use client";

import { useEffect, useId } from "react";
import {
  Crown,
  HelpCircle,
  Layers,
  Shield,
  UserCog,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChurchRolesGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChurchRolesGuideModal({
  open,
  onClose,
}: ChurchRolesGuideModalProps) {
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
        className="relative z-10 flex w-full max-w-lg flex-col rounded-t-2xl border border-border bg-background shadow-2xl sm:max-h-[min(90dvh,680px)] sm:rounded-2xl"
      >
        <header className="flex items-start gap-3 px-6 pb-4 pt-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-display text-lg font-semibold tracking-tight"
            >
              Como funcionam os cargos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entenda permissões, cargos padrão e como liberar acesso no painel.
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
              Cargo é um modelo de permissões — não é a pessoa.
            </p>
            <p className="mt-1 text-muted-foreground">
              Você define o que cada cargo pode ver e fazer; depois atribui um ou
              mais cargos a cada usuário em Configurações → Usuários.
            </p>
          </div>

          <section className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
              <Shield className="size-4" aria-hidden />
              <h3 className="text-sm font-semibold">Cargos padrão e personalizados</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-500" />
                <span>
                  <strong className="text-foreground">Cargos padrão</strong>{" "}
                  (Administrador, Pastor, Secretário…) vêm com a igreja. Você
                  pode ajustar as permissões, mas não excluir o cargo.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                <span>
                  <strong className="text-foreground">Cargos personalizados</strong>{" "}
                  são criados por você para necessidades específicas (ex.: líder
                  de recepção, tesouraria auxiliar).
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/70 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-foreground">
              <Layers className="size-4" aria-hidden />
              <h3 className="text-sm font-semibold">Duas camadas de permissão</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Acesso às seções</strong>{" "}
                  controla o que aparece no menu (Membros, Ministérios,
                  Comunicação…). Só leitura naquela área.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Ações administrativas</strong>{" "}
                  permitem criar, editar e excluir. Ao ativar uma ação, o acesso
                  à seção correspondente é incluído automaticamente.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  Se você desativar uma seção, as ações ligadas a ela também são
                  removidas — evita permissões “soltas” sem menu.
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/70 bg-muted/15 p-4">
            <div className="flex items-center gap-2 text-foreground">
              <UserCog className="size-4" aria-hidden />
              <h3 className="text-sm font-semibold">Atribuir cargos às pessoas</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Esta tela só define o modelo. Para dar acesso a alguém, vá em{" "}
              <strong className="text-foreground">Configurações → Usuários</strong>{" "}
              e marque os cargos da pessoa. Quem tem mais de um cargo recebe a{" "}
              <strong className="text-foreground">união</strong> de tudo o que
              cada cargo liberar.
            </p>
          </section>

          <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Crown className="size-4" aria-hidden />
              <h3 className="text-sm font-semibold">Proprietário da igreja</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              O proprietário tem acesso total — inclui assinatura, cargos e
              gestão de usuários. Isso não vem de um cargo comum; é um papel
              especial atribuído na transferência de propriedade.
            </p>
          </section>

          <p className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Depois de alterar um cargo, clique em{" "}
            <strong className="text-foreground">Salvar alterações</strong>. Quem
            já usa aquele cargo passa a ter o novo acesso na próxima vez que
            entrar no painel.
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
