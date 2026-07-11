import type { MemberStatus } from "@/types/members";

/** Semantic status chips — Institutional Quiet (no rainbow accents). */
export function memberStatusBadgeClass(status: MemberStatus): string {
  switch (status) {
    case "active":
      return "border-success/20 bg-success-subtle text-success-foreground";
    case "visitor":
      return "border-attention-border bg-attention-subtle text-attention-foreground";
    case "inactive":
      return "border-border bg-muted text-muted-foreground";
  }
}
