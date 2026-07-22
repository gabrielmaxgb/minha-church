import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Syne } from "next/font/google";

import { AuthBootSplashHost } from "@/components/auth/auth-boot-splash-host";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { defaultMetadata } from "@/lib/metadata";
import { IOS_SPLASH_IMAGES } from "@/lib/pwa/ios-splash";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

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
 * Favicon / PWA (`/icon.png`, `/icons/icon-*`): pomba em PNG transparente,
 * sem caixa branca — a aba do browser não deve mostrar quadrado branco.
 *
 * iOS home-screen (`/apple-touch-icon*.png`): fundo branco opaco + padding
 * (estilo ícone de app). Query `v=` quebra cache agressivo do Safari.
 * PNG opaco (sem alpha) — iOS às vezes rejeita ícone com transparência.
 *
 * Splash: `apple-touch-startup-image` por tamanho de tela + meta
 * `apple-mobile-web-app-capable` (Next 15 removeu; Safari ainda exige).
 */
export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: "/icon.png?v=20260720", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=20260720", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png?v=20260720",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/icons/apple-touch-icon-167.png?v=20260720",
        sizes: "167x167",
        type: "image/png",
      },
      {
        url: "/icons/apple-touch-icon-152.png?v=20260720",
        sizes: "152x152",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Minha Church",
    startupImage: [...IOS_SPLASH_IMAGES],
  },
  // Next 15 emite mobile-web-app-capable; Safari ainda precisa do nome antigo
  // para honrar apple-touch-startup-image.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Cor clara — evita flash preto ao abrir o PWA (theme-color + splash).
  themeColor: "#f5f5f2",
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
      style={{ backgroundColor: "#f5f5f2" }}
    >
      <body
        className="flex min-h-full flex-col bg-background"
        style={{ backgroundColor: "#f5f5f2" }}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <AuthBootSplashHost />
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
