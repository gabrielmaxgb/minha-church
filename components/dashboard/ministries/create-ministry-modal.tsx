"use client";

import { useEffect, useId, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMinistry } from "@/lib/api/queries";
import {
  createMinistrySchema,
  type CreateMinistryFormValues,
} from "@/lib/validation/schemas";
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
  const createMinistry = useCreateMinistry();

  const form = useForm<CreateMinistryFormValues>({
    resolver: zodResolver(createMinistrySchema),
    defaultValues: { name: "", description: "" },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = form;

  const description = watch("description");

  useEffect(() => {
    if (!open) {
      reset({ name: "", description: "" });
      clearErrors();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, reset, clearErrors]);

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

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");

    try {
      await createMinistry.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      });

      onClose();
    } catch (submitError) {
      setError("root", {
        message:
          submitError instanceof Error
            ? submitError.message
            : "Não foi possível criar o ministério. Tente novamente.",
      });
    }
  });

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

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            {errors.root?.message && <FormAlert>{errors.root.message}</FormAlert>}

            <FormField
              label="Nome do ministério"
              htmlFor="create-ministry-name"
              error={errors.name?.message}
              hint="Esse nome aparece na lista e na navegação do painel."
              required
            >
              <Input
                id="create-ministry-name"
                placeholder="Ex.: Louvor, Infantil, Recepção"
                disabled={createMinistry.isPending}
                autoFocus
                autoComplete="off"
                maxLength={80}
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
            </FormField>

            <FormField
              label="Descrição"
              htmlFor="create-ministry-description"
              hint="Ajuda a identificar o propósito da área na lista."
            >
              <Textarea
                id="create-ministry-description"
                placeholder="Ex.: Equipe responsável pela música e adoração nos cultos."
                disabled={createMinistry.isPending}
                rows={3}
                maxLength={DESCRIPTION_MAX_LENGTH}
                {...register("description")}
              />
              <p className="text-right text-xs text-muted-foreground" aria-live="polite">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </p>
            </FormField>
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
              disabled={createMinistry.isPending}
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
