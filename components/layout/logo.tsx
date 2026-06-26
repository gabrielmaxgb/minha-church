import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  className?: string;
  href?: string | null;
  size?: "sm" | "md";
}

const markClass = {
  sm: "size-7",
  md: "size-8",
} as const;

const textClass = {
  sm: "text-base",
  md: "text-sm",
} as const;

export function Logo({
  showText = true,
  className,
  href = "/",
  size = "sm",
}: LogoProps) {
  const content = (
    <>
      <Image
        src="/icon.png"
        alt=""
        width={32}
        height={32}
        className={cn("shrink-0 rounded-md object-cover", markClass[size])}
        priority
      />
      {showText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight",
            textClass[size],
          )}
        >
          {siteConfig.name}
        </span>
      )}
    </>
  );

  const wrapperClass = cn("inline-flex items-center gap-2.5", className);

  if (href) {
    return (
      <Link href={href} className={wrapperClass} aria-label={siteConfig.name}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}

export function LogoMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/icon.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-md object-cover", className)}
    />
  );
}
