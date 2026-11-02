/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/manual-therapy/world-approaches',
        destination: '/manual-therapy',
        permanent: true,
      },
      {
        source: '/manual-therapy/world-approaches/:slug',
        destination: '/manual-therapy/:slug',
        permanent: true,
      },
      {
        source: '/homepage',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.physionexusacademy.com' }],
        destination: 'https://physionexusacademy.com/:path*',
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
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=()',
          },
        ],
      },
    ];
  },
  images: {
    // Prefer modern, smaller formats for optimized Next/Image responses.
    formats: ['image/avif', 'image/webp'],
    // Keep transformed images warm between repeat visits without making
    // replaced images stale for an excessive period.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'd2ol7oe51mr4n9.cloudfront.net',
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

// OpenNext's dev-binding bridge is for local development, not CI/production builds.
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
