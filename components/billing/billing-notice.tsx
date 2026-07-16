import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  DashboardBanner,
  type DashboardBannerTone,
} from "@/components/ui/dashboard-banner";

export type BillingNoticeTone = "info" | "urgent" | "critical";

const toneMap: Record<BillingNoticeTone, DashboardBannerTone> = {
  info: "billing",
  urgent: "billing-urgent",
  critical: "billing-critical",
};

interface BillingNoticeProps {
  tone?: BillingNoticeTone;
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Aviso de assinatura/billing — layout padronizado, identidade billing. */
export function BillingNotice({
  tone = "info",
  icon,
  title,
  description,
  action,
  className,
}: BillingNoticeProps) {
  return (
    <DashboardBanner
      tone={toneMap[tone]}
      icon={icon}
      label="Assinatura"
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}
