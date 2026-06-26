import type { Metadata } from "next";

import { siteConfig } from "@/constants/navigation";

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export const siteUrl = getSiteUrl();

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export function createPageMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
    },
    twitter: {
      title: fullTitle,
      description,
    },
  };
}
