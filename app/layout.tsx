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
 * Icons: use file conventions only (`app/icon.png`, `app/apple-icon.png`).
 * Avoid `import icon from "./icon.png"` in metadata — Turbopack can throw
 * `require is not defined` when composing page + image metadata modules.
 */
export const metadata: Metadata = {
  ...defaultMetadata,
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
