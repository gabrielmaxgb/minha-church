import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";

function buildSecurityHeaders() {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  const connectSrc = isDev
    ? "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:*"
    : "connect-src 'self'";

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
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        connectSrc,
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
