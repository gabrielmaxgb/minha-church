import { rosterAvailabilityCopy } from "@/lib/events/member-response-copy";
import type { EventAvailabilityStatus } from "@/lib/ministries/roster";

export function getAvailabilityTheme(
  status: EventAvailabilityStatus | null | undefined,
) {
  if (status === "available") {
    return {
      shell: "border-success/30 bg-success-subtle",
      statusTitle: rosterAvailabilityCopy.status.availableTitle,
      statusHint: rosterAvailabilityCopy.status.availableHint,
      statusTone: "text-success-foreground",
      statusHintTone: "text-muted-foreground",
      roleActive: "border-success bg-success text-white",
      roleIdle:
        "border-success/25 bg-card text-success-foreground/80 hover:border-success/40 hover:text-success-foreground",
      messageBox: "border-success/20 bg-success-subtle",
      messageLabel: "text-success-foreground",
      primaryButton: "bg-success text-white hover:bg-success/90",
      secondaryButton:
        "border-success/40 bg-success-subtle text-success-foreground hover:bg-success/15",
    };
  }

  if (status === "unavailable") {
    return {
      shell: "border-destructive/35 bg-destructive/8",
      statusTitle: rosterAvailabilityCopy.status.unavailableTitle,
      statusHint: rosterAvailabilityCopy.status.unavailableHint,
      statusTone: "text-destructive",
      statusHintTone: "text-destructive/80",
      roleActive:
        "border-destructive bg-destructive text-white",
      roleIdle:
        "border-destructive/20 bg-card text-destructive/70 hover:border-destructive/35 hover:text-destructive",
      messageBox: "border-destructive/20 bg-destructive/5",
      messageLabel: "text-destructive",
      primaryButton: "bg-destructive text-white hover:bg-destructive/90",
      secondaryButton:
        "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10",
    };
  }

  return {
    shell: "border-attention-border bg-attention-subtle",
    statusTitle: rosterAvailabilityCopy.status.pendingTitle,
    statusHint: rosterAvailabilityCopy.status.pendingHint,
    statusTone: "text-attention-foreground",
    statusHintTone: "text-muted-foreground",
    roleActive: "border-foreground bg-foreground text-background",
    roleIdle:
      "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
    messageBox: "border-border bg-muted/40",
    messageLabel: "text-muted-foreground",
    primaryButton: "",
    secondaryButton: "",
  };
}
