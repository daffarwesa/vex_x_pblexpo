import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
    dangerouslyAllowLocalIP: true, // hanya untuk development!
  },

  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'http://localhost:8000/storage/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;