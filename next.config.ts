import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip/brotli-compress HTML and API responses
  compress: true,
  // Drop the `X-Powered-By: Next.js` header (tiny size + security win)
  poweredByHeader: false,

  experimental: {
    // Tree-shake large packages to reduce JS bundle size on mobile
    optimizePackageImports: ["jose", "bcryptjs", "nodemailer"],
  },

  async redirects() {
    return [
      { source: "/magasin", destination: "/contact", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Block site from being embedded in iframes (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Legacy XSS filter
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Limit referrer info sent to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable unused browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()",
          },
          // Force HTTPS for 2 years once deployed
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent DNS prefetching leaking browsing context
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Block opening pages in cross-origin popups
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // Only send resources to same-origin or explicit cross-origin
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },

  images: {
    // Serve modern, far smaller formats automatically
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 1 year at the CDN/edge
    minimumCacheTTL: 31536000,
    // Tailored breakpoints to avoid over-sized image variants
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
