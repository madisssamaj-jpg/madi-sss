import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://images.unsplash.com https://upload.wikimedia.org https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://www.madisss.org.np https://madisss.org.np https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com;
  frame-ancestors 'none';
  frame-src 'self' https://*.supabase.co;
  base-uri 'self';
  form-action 'self' https://www.madisss.org.np https://madisss.org.np;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  trailingSlash: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['www.madisss.org.np', 'madisss.org.np', 'localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/ne',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/ne/feedback',
        permanent: true,
      },
      {
        source: '/apply',
        destination: '/ne/membership',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
