import type { EventAvailabilityStatus } from "@/lib/ministries/roster";

export function getAvailabilityTheme(
  status: EventAvailabilityStatus | null | undefined,
) {
  if (status === "available") {
    return {
      shell: "border-emerald-500/35 bg-emerald-500/10",
      statusTitle: "Você marcou: posso ir",
      statusHint: "Sua disponibilidade foi registrada.",
      statusTone: "text-emerald-900 dark:text-emerald-100",
      statusHintTone: "text-emerald-800/80 dark:text-emerald-200/80",
      roleActive:
        "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-500 dark:bg-emerald-600",
      roleIdle:
        "border-emerald-500/25 bg-background/80 text-emerald-900/70 hover:border-emerald-600/40 hover:text-emerald-900 dark:text-emerald-100/80",
      messageBox: "border-emerald-500/20 bg-emerald-500/8",
      messageLabel: "text-emerald-800 dark:text-emerald-300",
      primaryButton: "bg-emerald-600 text-white hover:bg-emerald-600/90",
      secondaryButton:
        "border-emerald-600/40 bg-emerald-500/5 text-emerald-900 hover:bg-emerald-500/15 dark:text-emerald-100",
    };
  }

  if (status === "unavailable") {
    return {
      shell: "border-destructive/35 bg-destructive/8",
      statusTitle: "Você marcou: não posso ir",
      statusHint: "O líder já sabe que você não está disponível neste dia.",
      statusTone: "text-destructive",
      statusHintTone: "text-destructive/80",
      roleActive:
        "border-destructive bg-destructive text-destructive-foreground",
      roleIdle:
        "border-destructive/20 bg-background/80 text-destructive/70 hover:border-destructive/35 hover:text-destructive",
      messageBox: "border-destructive/20 bg-destructive/5",
      messageLabel: "text-destructive",
      primaryButton: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      secondaryButton:
        "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10",
    };
  }

  return {
    shell: "border-amber-500/35 bg-amber-500/8",
    statusTitle: "Ainda não respondeu",
    statusHint: "Escolha se pode ir neste dia.",
    statusTone: "text-amber-950 dark:text-amber-100",
    statusHintTone: "text-amber-900/75 dark:text-amber-100/75",
    roleActive: "border-foreground bg-foreground text-background",
    roleIdle:
      "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
    messageBox: "border-sky-500/20 bg-sky-500/8",
    messageLabel: "text-sky-800 dark:text-sky-300",
    primaryButton: "",
    secondaryButton: "",
  };
}
