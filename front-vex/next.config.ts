import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

let apiHost = 'localhost';
let apiPort: string | undefined = '8000';
let apiProto: 'http' | 'https' = 'http';

try {
  const parsed = new URL(API_URL);
  apiHost = parsed.hostname;
  apiPort = parsed.port || undefined;
  apiProto = parsed.protocol.replace(':', '') as 'http' | 'https';
} catch {
  // Fallback to default
}

const customDomains = (process.env.NEXT_PUBLIC_REMOTE_IMAGE_DOMAINS || '')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean);

const defaultRemotePatterns: Array<{
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname: string;
}> = [
  {
    protocol: apiProto,
    hostname: apiHost,
    port: apiPort,
    pathname: '/**',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '8000',
    pathname: '/**',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '8000',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'drive.google.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'lh3.googleusercontent.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'img.youtube.com',
    pathname: '/**',
  },
  ...customDomains.map((domain) => ({
    protocol: 'https' as const,
    hostname: domain,
    pathname: '/**',
  })),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: defaultRemotePatterns,
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },

  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: `${API_URL}/storage/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;