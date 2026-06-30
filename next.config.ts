import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
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
