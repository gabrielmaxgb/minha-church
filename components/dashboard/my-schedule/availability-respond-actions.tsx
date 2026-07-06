"use client";

import { Check, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ScheduleAvailabilityAction } from "@/lib/my-schedule/event-display";
import { cn } from "@/lib/utils";

interface AvailabilityRespondActionsProps {
  busy?: boolean;
  layout?: "compact" | "default" | "card";
  availabilityStatus?: "available" | "unavailable" | null;
  showClear?: boolean;
  onRespond: (status: ScheduleAvailabilityAction) => void;
  className?: string;
}

export function AvailabilityRespondActions({
  busy = false,
  layout = "default",
  availabilityStatus = null,
  showClear = false,
  onRespond,
  className,
}: AvailabilityRespondActionsProps) {
  const isAvailable = availabilityStatus === "available";
  const isUnavailable = availabilityStatus === "unavailable";

  if (layout === "card") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            size="lg"
            disabled={busy}
            className="h-12 bg-emerald-600 text-base hover:bg-emerald-600/90"
            onClick={() => onRespond("available")}
          >
            <Check className="size-5" />
            Sim, posso ir
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={busy}
            className="h-12 text-base"
            onClick={() => onRespond("unavailable")}
          >
            <X className="size-5" />
            Não posso
          </Button>
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Button
          type="button"
          size="sm"
          variant={isAvailable ? "default" : "outline"}
          disabled={busy}
          className={cn(
            isAvailable && "bg-emerald-600 hover:bg-emerald-600/90",
          )}
          onClick={() => onRespond(isAvailable ? "clear" : "available")}
        >
          <Check className="size-4" />
          Posso
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isUnavailable ? "destructive" : "outline"}
          disabled={busy}
          onClick={() => onRespond(isUnavailable ? "clear" : "unavailable")}
        >
          <X className="size-4" />
          Não posso
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy || isAvailable}
          className="h-9 bg-emerald-600 hover:bg-emerald-600/90"
          onClick={() => onRespond("available")}
        >
          <Check className="size-3.5" />
          Posso ir
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || isUnavailable}
          className="h-9"
          onClick={() => onRespond("unavailable")}
        >
          <X className="size-3.5" />
          Não posso
        </Button>
      </div>
      {showClear && availabilityStatus && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className="w-full text-muted-foreground"
          onClick={() => onRespond("clear")}
        >
          <RotateCcw className="size-4" />
          Desfazer resposta
        </Button>
      )}
    </div>
  );
}
