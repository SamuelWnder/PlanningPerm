import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Stop MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer policy — don't leak full URL to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 2 years, include subdomains
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Disable browser features we don't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + Plausible
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://cdn.paddle.com https://public.profitwell.com",
      // Styles: self + inline (Tailwind generates inline) + Paddle
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net https://api.fonts.coollabs.io https://cdn.paddle.com",
      // Fonts
      "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net https://api.fonts.coollabs.io",
      // Images: self + data URIs + OS Maps tiles
      "img-src 'self' data: blob: https://*.os.uk https://*.ordnancesurvey.co.uk https://images.unsplash.com",
      // API calls to external services
      [
        "connect-src 'self'",
        "https://plausible.io",
        "https://*.supabase.co",
        "https://api.anthropic.com",
        "https://api.os.uk",
        "https://api.paddle.com",
        "https://checkout.paddle.com",
        "https://cdn.paddle.com",
        "https://www.planning.data.gov.uk",
        "https://services-eu1.arcgis.com",
        "https://environment.data.gov.uk",
        "https://epc.opendatacommunities.org",
        "https://map.bgs.ac.uk",
        "https://historicengland.org.uk",
      ].join(" "),
      // Videos in public/
      "media-src 'self'",
      // iframes — Paddle checkout overlay
      "frame-src https://checkout.paddle.com https://buy.paddle.com",
      // Workers
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Reduce attack surface — hide X-Powered-By: Next.js header
  poweredByHeader: false,

  // Strict mode catches accidental double-renders in dev
  reactStrictMode: true,
};

export default nextConfig;
