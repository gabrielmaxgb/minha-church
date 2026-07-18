"use client";

import { useId, useRef } from "react";
import { Pencil, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { ChurchRolePermissionsSummary } from "./church-role-permissions-editor";

interface ChurchRoleNameHeaderProps {
  name: string;
  enabledCount: number;
  totalCount: number;
  isNameDirty: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onNameChange: (value: string) => void;
  onDelete: () => void;
}

export function ChurchRoleNameHeader({
  name,
  enabledCount,
  totalCount,
  isNameDirty,
  isSaving,
  isDeleting,
  onNameChange,
  onDelete,
}: ChurchRoleNameHeaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function focusNameInput() {
    inputRef.current?.focus();
    inputRef.current?.select();
  }

  return (
    <div className="border-b border-border/70 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
          <Sparkles className="size-3" aria-hidden />
          Cargo personalizado
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 text-muted-foreground hover:text-destructive"
          disabled={isDeleting || isSaving}
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Excluir cargo
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-lg flex-1">
        <FormField
          label="Nome do cargo"
          htmlFor={inputId}
          hint="Este nome aparece ao atribuir cargos aos usuários da igreja."
        >
          <div className="group relative">
            <Input
              id={inputId}
              ref={inputRef}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Ex.: Diácono, Coordenador de louvor..."
              disabled={isSaving}
              aria-invalid={isNameDirty}
              className={cn(
                "pr-11 text-base font-medium transition-colors",
                isNameDirty &&
                  "border-attention-border bg-attention-subtle focus-visible:bg-attention-mark",
                !isNameDirty &&
                  "group-hover:border-border group-hover:bg-background",
              )}
            />
            <button
              type="button"
              onClick={focusNameInput}
              disabled={isSaving}
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              aria-label="Editar nome do cargo"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        </FormField>

        {isNameDirty && (
          <p className="mt-2 text-xs font-medium text-attention-foreground">
            Nome alterado — salve para aplicar.
          </p>
        )}
        </div>

        <ChurchRolePermissionsSummary
          enabledCount={enabledCount}
          total={totalCount}
        />
      </div>
    </div>
  );
}
