import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";

function buildSecurityHeaders() {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
    : "script-src 'self' 'unsafe-inline' https://js.stripe.com";

  // Browser chama Stripe e, se NEXT_PUBLIC_API_URL for absoluto, o BE no Railway.
  // Com `/api/v1` (recomendado), as calls ficam em 'self' via rewrite.
  const apiProxyOrigin = (process.env.API_PROXY_TARGET ?? "")
    .trim()
    .replace(/\/$/, "");
  const connectSrcParts = [
    "'self'",
    "https://api.stripe.com",
    "https://*.up.railway.app",
  ];
  if (apiProxyOrigin) {
    connectSrcParts.push(apiProxyOrigin);
  }
  if (isDev) {
    connectSrcParts.push(
      "ws://localhost:*",
      "ws://127.0.0.1:*",
      "http://localhost:*",
      "http://127.0.0.1:*",
    );
  }
  const connectSrc = `connect-src ${connectSrcParts.join(" ")}`;

  const headers = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        scriptSrc,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://*.stripe.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        connectSrc,
        "frame-src https://js.stripe.com https://hooks.stripe.com",
        "worker-src 'self'",
        "manifest-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
    },
  ];

  if (!isDev) {
    headers.splice(4, 0, {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "development",
  },
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders(),
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/app/cultos",
        destination: "/app/atividades",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const apiOrigin = process.env.API_PROXY_TARGET ?? "http://localhost:3001";

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
