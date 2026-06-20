import type { NextConfig } from "next";

// Applied everywhere except embed routes
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

// Embed routes: allow iframing from any origin, CORS for API calls
const embedHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Content-Security-Policy', value: "frame-ancestors *" },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

const corsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: '*' },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
]

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      // Embed pages: iframeable from any origin
      {
        source: '/embed/:path*',
        headers: embedHeaders,
      },
      // Public API: CORS so embed pages can POST from within iframes
      {
        source: '/api/public/:path*',
        headers: corsHeaders,
      },
      // Everything else: standard security headers
      {
        source: '/((?!embed).*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
