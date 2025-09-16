import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Enable optimized package imports
    optimizePackageImports: ['@fullcalendar/react', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
    // Enable optimized CSS
    optimizeCss: true,
    // Enable server components
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add domains if you're loading external images
    domains: [],
    // Optimize caching
    minimumCacheTTL: 31536000, // 1 year
    // Handle large images better
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable optimization for better performance
    unoptimized: false,
    // Add formats for better compression
    formats: ['image/webp', 'image/avif'],
    // Enable lazy loading by default
    loader: 'default',
  },
  // Enable compression
  compress: true,
  // Optimize bundle
  swcMinify: true,
  // Enable static optimization
  trailingSlash: false,
  // Optimize for production
  poweredByHeader: false,
};

export default nextConfig;