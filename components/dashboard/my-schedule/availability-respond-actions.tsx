"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Loader2, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { settingsSectionPath } from "@/constants/routes";
import { rosterAvailabilityCopy } from "@/lib/events/member-response-copy";
import type { ScheduleAvailabilityAction } from "@/lib/my-schedule/event-display";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";

interface AvailabilityFunctionsGateProps {
  className?: string;
}

export function AvailabilityFunctionsGate({
  className,
}: AvailabilityFunctionsGateProps) {
  return (
    <div className={cn(pendingNotificationStyles.banner.compact, className)}>
      <p className="text-sm font-medium text-foreground">
        {rosterAvailabilityCopy.setup.functionsGateTitle}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {rosterAvailabilityCopy.setup.functionsGateHint}
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-3"
        asChild
      >
        <Link href={settingsSectionPath("ministries")}>
          Configurar funções
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

interface AvailabilityRespondActionsProps {
  needsRosterFunctions?: boolean;
  busy?: boolean;
  layout?: "compact" | "default" | "card";
  availabilityStatus?: "available" | "unavailable" | null;
  showClear?: boolean;
  onRespond: (status: ScheduleAvailabilityAction) => void;
  className?: string;
}

export function AvailabilityRespondActions({
  needsRosterFunctions = false,
  busy = false,
  layout = "default",
  availabilityStatus = null,
  showClear = false,
  onRespond,
  className,
}: AvailabilityRespondActionsProps) {
  const isAvailable = availabilityStatus === "available";
  const isUnavailable = availabilityStatus === "unavailable";
  const [pendingAction, setPendingAction] =
    useState<ScheduleAvailabilityAction | null>(null);

  useEffect(() => {
    if (!busy) {
      setPendingAction(null);
    }
  }, [busy]);

  function submit(status: ScheduleAvailabilityAction) {
    setPendingAction(status);
    onRespond(status);
  }

  if (needsRosterFunctions) {
    return <AvailabilityFunctionsGate className={className} />;
  }

  if (layout === "card") {
    return (
      <div className={cn("space-y-2", className)} aria-busy={busy || undefined}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            size="lg"
            disabled={busy}
            className="h-12 bg-success text-base text-white hover:bg-success/90"
            aria-busy={(busy && pendingAction === "available") || undefined}
            onClick={() => submit("available")}
          >
            {busy && pendingAction === "available" ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <Check className="size-5" aria-hidden />
            )}
            {busy && pendingAction === "available"
              ? "Salvando..."
              : rosterAvailabilityCopy.buttons.availableEmphasis}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={busy}
            className="h-12 text-base"
            aria-busy={(busy && pendingAction === "unavailable") || undefined}
            onClick={() => submit("unavailable")}
          >
            {busy && pendingAction === "unavailable" ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <X className="size-5" aria-hidden />
            )}
            {busy && pendingAction === "unavailable"
              ? "Salvando..."
              : rosterAvailabilityCopy.buttons.unavailable}
          </Button>
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    const pendingAvailable =
      pendingAction === "available" ||
      (pendingAction === "clear" && isAvailable);
    const pendingUnavailable =
      pendingAction === "unavailable" ||
      (pendingAction === "clear" && isUnavailable);

    return (
      <div
        className={cn("flex flex-wrap gap-2", className)}
        aria-busy={busy || undefined}
      >
        <Button
          type="button"
          size="sm"
          variant={isAvailable ? "default" : "outline"}
          disabled={busy}
          className={cn(
            isAvailable && "bg-success text-white hover:bg-success/90",
          )}
          aria-busy={(busy && pendingAvailable) || undefined}
          onClick={() => submit(isAvailable ? "clear" : "available")}
        >
          {busy && pendingAvailable ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Check className="size-4" aria-hidden />
          )}
          {busy && pendingAvailable ? "Salvando..." : rosterAvailabilityCopy.buttons.available}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isUnavailable ? "destructive" : "outline"}
          disabled={busy}
          aria-busy={(busy && pendingUnavailable) || undefined}
          onClick={() => submit(isUnavailable ? "clear" : "unavailable")}
        >
          {busy && pendingUnavailable ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <X className="size-4" aria-hidden />
          )}
          {busy && pendingUnavailable ? "Salvando..." : rosterAvailabilityCopy.buttons.unavailable}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)} aria-busy={busy || undefined}>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy || isAvailable}
          className="h-9 bg-success text-white hover:bg-success/90"
          aria-busy={(busy && pendingAction === "available") || undefined}
          onClick={() => submit("available")}
        >
          {busy && pendingAction === "available" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Check className="size-3.5" aria-hidden />
          )}
          {busy && pendingAction === "available" ? "Salvando..." : rosterAvailabilityCopy.buttons.available}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || isUnavailable}
          className="h-9"
          aria-busy={(busy && pendingAction === "unavailable") || undefined}
          onClick={() => submit("unavailable")}
        >
          {busy && pendingAction === "unavailable" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <X className="size-3.5" aria-hidden />
          )}
          {busy && pendingAction === "unavailable"
            ? "Salvando..."
            : rosterAvailabilityCopy.buttons.unavailable}
        </Button>
      </div>
      {showClear && availabilityStatus && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className="w-full text-muted-foreground"
          aria-busy={(busy && pendingAction === "clear") || undefined}
          onClick={() => submit("clear")}
        >
          {busy && pendingAction === "clear" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <RotateCcw className="size-4" aria-hidden />
          )}
          {busy && pendingAction === "clear"
            ? "Limpando..."
            : rosterAvailabilityCopy.buttons.undo}
        </Button>
      )}
    </div>
  );
}
