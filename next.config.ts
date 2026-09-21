import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Crossfade App Router navigations via the View Transitions API.
    viewTransition: true,
    // The price board scanner sends a base64 photo as a server action
    // argument; a real phone photo comfortably exceeds Next's 1MB default.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Baseline security headers. Static and declarative, so this adds no
  // runtime cost or bundle size — just a few extra response headers.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
