"use client";

import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/constants/navigation";
import { AUTH_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface SidebarChurchBrandProps {
  className?: string;
}

export function SidebarChurchBrand({ className }: SidebarChurchBrandProps) {
  const { church, isSwitchingChurch } = useAuth();
  const churchName = church?.name ?? "Sua igreja";

  return (
    <Link
      href={AUTH_ROUTES.dashboard}
      className={cn(
        "block rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40",
        isSwitchingChurch && "pointer-events-none opacity-60",
        className,
      )}
      aria-label={`${churchName} — painel ${siteConfig.name}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
          <Image
            src="/icon.png"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-sm object-cover"
          />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[10px] font-medium text-muted-foreground">
            {siteConfig.name}
          </p>
          <h2 className="mt-0.5 text-sm font-medium leading-snug tracking-tight text-foreground line-clamp-2">
            {churchName}
          </h2>
        </div>
      </div>
    </Link>
  );
}
