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
        "group relative block overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-background via-surface-elevated to-primary/[0.07] p-3.5 shadow-soft transition-all duration-300 hover:border-primary/20 hover:shadow-elevated",
        isSwitchingChurch && "pointer-events-none opacity-60",
        className,
      )}
      aria-label={`${churchName} — painel ${siteConfig.name}`}
    >
      <span
        className="pointer-events-none absolute -left-8 top-1/2 size-28 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-2xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-4 -top-6 size-20 rounded-full bg-primary/[0.04] blur-xl"
        aria-hidden
      />

      <div className="relative flex items-start gap-3">
        <span className="relative mt-0.5 shrink-0">
          <span
            className="absolute -inset-1.5 rounded-[14px] bg-primary/[0.1] opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
          <span className="relative flex size-12 -rotate-6 items-center justify-center rounded-[14px] border border-primary/15 bg-background shadow-soft ring-1 ring-primary/5 transition-transform duration-300 group-hover:rotate-0">
            <Image
              src="/icon.png"
              alt=""
              width={30}
              height={30}
              className="size-[1.875rem] rotate-6 rounded-md object-cover transition-transform duration-300 group-hover:rotate-0"
            />
          </span>
        </span>

        <div className="min-w-0 flex-1 pt-1">
          <h2 className="font-display text-[1.125rem] font-bold leading-[1.12] tracking-tight text-foreground line-clamp-3">
            {churchName}
          </h2>
        </div>
      </div>

      <div className="relative mt-3.5 flex items-center gap-2 border-t border-dashed border-border/70 pt-2.5">
        <span
          className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"
          aria-hidden
        />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2 py-0.5 text-muted-foreground/70 transition-colors group-hover:bg-muted/80 group-hover:text-muted-foreground">
          <Image
            src="/icon.png"
            alt=""
            width={12}
            height={12}
            className="size-3 rounded-[4px] object-cover opacity-50"
          />
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em]">
            {siteConfig.name}
          </span>
        </span>
      </div>
    </Link>
  );
}
