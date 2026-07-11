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
        "group relative block overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-domain-members-subtle via-card to-attention-subtle/70 p-3.5 shadow-xs transition-[box-shadow,transform,border-color] duration-200 hover:border-domain-members/25 hover:shadow-popover",
        isSwitchingChurch && "pointer-events-none opacity-60",
        className,
      )}
      aria-label={`${churchName} — painel ${siteConfig.name}`}
    >
      <div
        className="pointer-events-none absolute -left-8 -top-10 size-28 rounded-full bg-domain-members/15 blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -right-6 size-24 rounded-full bg-attention/20 blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-xs ring-1 ring-domain-members/10">
          <Image
            src="/icon.png"
            alt=""
            width={32}
            height={32}
            className="size-8 object-cover"
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium tracking-wide text-domain-members-foreground/80">
            {siteConfig.name}
          </p>
          <h2 className="mt-0.5 font-display text-[15px] font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
            {churchName}
          </h2>
        </div>
      </div>
    </Link>
  );
}
