"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Layers, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMinistry } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

interface CreateMinistryModalProps {
  open: boolean;
  onClose: () => void;
}

const DESCRIPTION_MAX_LENGTH = 200;

export function CreateMinistryModal({ open, onClose }: CreateMinistryModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createMinistry = useCreateMinistry();

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const canSubmit = trimmedName.length > 0 && !createMinistry.isPending;

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setError(null);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !createMinistry.isPending) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, createMinistry.isPending]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!trimmedName) {
      setError("Informe um nome para o ministério.");
      return;
    }

    try {
      await createMinistry.mutateAsync({
        name: trimmedName,
        description: trimmedDescription || undefined,
      });

      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar o ministério. Tente novamente.",
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
        aria-label="Fechar modal"
        disabled={createMinistry.isPending}
        onClick={() => {
          if (!createMinistry.isPending) {
            onClose();
          }
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,640px)] w-full max-w-lg flex-col",
          "rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl",
        )}
      >
        <header className="flex items-start gap-4 px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Layers className="size-5" aria-hidden />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id={titleId}
              className="font-display text-xl font-semibold tracking-tight"
            >
              Novo ministério
            </h2>
            <p
              id={descriptionId}
              className="mt-1 text-sm leading-relaxed text-muted-foreground"
            >
              Organize uma área de serviço com cargos, permissões e eventos
              próprios.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createMinistry.isPending}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        <Separator />

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-border bg-muted/60 px-3 py-2.5 text-sm text-foreground"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="create-ministry-name" className="text-sm font-medium">
                  Nome do ministério
                </Label>
                <span className="text-xs text-muted-foreground">Obrigatório</span>
              </div>
              <Input
                id="create-ministry-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Louvor, Infantil, Recepção"
                disabled={createMinistry.isPending}
                autoFocus
                autoComplete="off"
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground">
                Esse nome aparece na lista e na navegação do painel.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <Label
                  htmlFor="create-ministry-description"
                  className="text-sm font-medium"
                >
                  Descrição
                </Label>
                <span className="text-xs text-muted-foreground">Opcional</span>
              </div>
              <Textarea
                id="create-ministry-description"
                value={description}
                onChange={(event) => {
                  if (event.target.value.length <= DESCRIPTION_MAX_LENGTH) {
                    setDescription(event.target.value);
                  }
                }}
                placeholder="Ex.: Equipe responsável pela música e adoração nos cultos."
                disabled={createMinistry.isPending}
                rows={3}
              />
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Ajuda a identificar o propósito da área na lista.</span>
                <span aria-live="polite">
                  {description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <footer className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMinistry.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full sm:w-auto"
            >
              {createMinistry.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar ministério"
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
