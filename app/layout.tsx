import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Syne } from "next/font/google";

import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { defaultMetadata } from "@/lib/metadata";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * iOS home-screen: precisa de `/apple-touch-icon.png` na raiz (público)
 * + link explícito. Query `v=` quebra cache agressivo do Safari.
 * PNG opaco (sem alpha) — iOS às vezes rejeita ícone com transparência.
 */
export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png?v=20260718",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/icons/apple-touch-icon-167.png?v=20260718",
        sizes: "167x167",
        type: "image/png",
      },
      {
        url: "/icons/apple-touch-icon-152.png?v=20260718",
        sizes: "152x152",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Minha Church",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${syne.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col"
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
