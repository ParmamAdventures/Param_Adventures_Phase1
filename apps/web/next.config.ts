import type { NextConfig } from "next";

// @ts-ignore
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "**", 
      },
    ],
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "akash-mishra",
  project: "param-adventures-web",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Route browser requests to Sentry through the Next.js server to circumvent ad-blockers
  // tunnelRoute: "/monitoring",

  // Automatically annotate React components to show some context
  reactComponentAnnotation: {
    enabled: true,
  },
});
