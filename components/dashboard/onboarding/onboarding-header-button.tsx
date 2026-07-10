"use client";

import { Rocket } from "lucide-react";

import { useOnboardingChecklist } from "@/components/dashboard/onboarding/onboarding-checklist-context";
import { pendingNotificationStyles } from "@/lib/ui/notification-styles";
import { cn } from "@/lib/utils";

export function OnboardingHeaderButton() {
  const onboarding = useOnboardingChecklist();

  if (!onboarding?.showLauncher) {
    return null;
  }

  const {
    openOnboarding,
    completedCount,
    totalSteps,
    open,
  } = onboarding;

  const pendingCount = totalSteps - completedCount;
  const hasPending = pendingCount > 0;

  return (
    <button
      type="button"
      onClick={openOnboarding}
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/60 shadow-soft transition-all duration-200",
        "text-foreground hover:bg-background hover:shadow-elevated",
        open && "bg-background shadow-elevated",
      )}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={
        hasPending
          ? `Primeiros passos — ${pendingCount} passo${pendingCount === 1 ? "" : "s"} pendente${pendingCount === 1 ? "" : "s"}`
          : "Primeiros passos — tudo concluído"
      }
    >
      <Rocket className="size-4" aria-hidden />
      {hasPending && (
        <span className={pendingNotificationStyles.bellBadge}>
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      )}
    </button>
  );
}
