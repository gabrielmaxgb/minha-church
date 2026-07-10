"use client";

import { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";

import { EventMutationScopeFields } from "@/components/dashboard/activities/event-mutation-scope-fields";
import { Button } from "@/components/ui/button";
import type { EventMutationScope } from "@/types/events";

interface EventMutationScopeDialogProps {
  open: boolean;
  action: "edit" | "delete";
  busy?: boolean;
  onConfirm: (scope: EventMutationScope) => void;
  onCancel: () => void;
}

export function EventMutationScopeDialog({
  open,
  action,
  busy = false,
  onConfirm,
  onCancel,
}: EventMutationScopeDialogProps) {
  const titleId = useId();
  const [scope, setScope] = useState<EventMutationScope>("this");

  useEffect(() => {
    if (open) {
      setScope("this");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const actionLabel = action === "delete" ? "Excluir" : "Salvar alterações";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Cancelar"
        disabled={busy}
        onClick={() => {
          if (!busy) {
            onCancel();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-popover"
      >
        <h3 id={titleId} className="text-lg font-semibold tracking-tight">
          Evento recorrente
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Como no Google Agenda: escolha em quais ocorrências aplicar esta ação.
        </p>

        <div className="mt-5">
          <EventMutationScopeFields
            name="mutation-scope-dialog"
            value={scope}
            onChange={setScope}
            disabled={busy}
            actionLabel={action}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={action === "delete" ? "destructive" : "default"}
            disabled={busy}
            onClick={() => onConfirm(scope)}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
