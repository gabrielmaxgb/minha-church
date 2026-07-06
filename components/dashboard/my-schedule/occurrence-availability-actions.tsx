"use client";

import { Check, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ScheduleAvailabilityAction } from "@/lib/my-schedule/event-display";
import { cn } from "@/lib/utils";

interface OccurrenceAvailabilityActionsProps {
  availabilityStatus: "available" | "unavailable" | null;
  hasProfileRoles: boolean;
  busy?: boolean;
  layout?: "compact" | "default";
  className?: string;
  onRespond: (status: ScheduleAvailabilityAction) => void;
}

export function OccurrenceAvailabilityActions({
  availabilityStatus,
  hasProfileRoles,
  busy = false,
  layout = "default",
  className,
  onRespond,
}: OccurrenceAvailabilityActionsProps) {
  const isAvailable = availabilityStatus === "available";
  const isUnavailable = availabilityStatus === "unavailable";

  function submitAvailable() {
    onRespond("available");
  }

  function submitUnavailable() {
    onRespond("unavailable");
  }

  function submitClear() {
    onRespond("clear");
  }

  if (layout === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Button
          type="button"
          size="sm"
          variant={isAvailable ? "default" : "outline"}
          disabled={busy || !hasProfileRoles}
          className={cn(isAvailable && "bg-emerald-600 hover:bg-emerald-600/90")}
          onClick={() => (isAvailable ? submitClear() : submitAvailable())}
        >
          <Check className="size-4" />
          Posso
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isUnavailable ? "destructive" : "outline"}
          disabled={busy}
          onClick={() => (isUnavailable ? submitClear() : submitUnavailable())}
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
          disabled={busy || isAvailable || !hasProfileRoles}
          className="h-9 bg-emerald-600 hover:bg-emerald-600/90"
          onClick={submitAvailable}
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
          onClick={submitUnavailable}
        >
          <X className="size-3.5" />
          Não posso
        </Button>
      </div>
      {availabilityStatus && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className="w-full text-muted-foreground"
          onClick={submitClear}
        >
          <RotateCcw className="size-4" />
          Desfazer resposta
        </Button>
      )}
    </div>
  );
}
