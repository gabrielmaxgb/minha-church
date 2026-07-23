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
        "group relative block overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-domain-members-subtle/90 via-card to-attention-subtle/70 px-4 py-3.5 shadow-xs transition-[box-shadow,border-color,transform] duration-200 hover:border-domain-members/35 hover:shadow-popover",
        isSwitchingChurch && "pointer-events-none opacity-60",
        className,
      )}
      aria-label={`${churchName} — painel ${siteConfig.name}`}
    >
      <div
        className="pointer-events-none absolute -left-10 -top-12 size-32 rounded-full bg-domain-members/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 -bottom-12 size-28 rounded-full bg-attention/14 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-2">
        <div className="flex items-center gap-1.5">
          <Image
            src="/icon.png"
            alt=""
            width={14}
            height={14}
            className="size-3.5 shrink-0 object-contain opacity-75"
          />
          <p className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground">
            {siteConfig.name}
          </p>
        </div>

        <h2 className="font-display text-[17px] font-semibold leading-[1.25] tracking-tight text-foreground line-clamp-2">
          {churchName}
        </h2>

        <div
          className="h-px w-7 bg-domain-members/70 transition-[width] duration-200 group-hover:w-10"
          aria-hidden
        />
      </div>
    </Link>
  );
}
