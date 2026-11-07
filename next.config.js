/** @type {import('next').NextConfig} */
const nextConfig = {
  // A harmless build-time flag; the Preview password itself is a Worker secret.
  env: {
    PNA_PREVIEW_BUILD: process.env.PNA_PREVIEW_BUILD === 'true' ? 'true' : 'false',
  },
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
      // Retired sections (2026-11): keep old links and bookmarks working.
      { source: '/courses', destination: '/learn', permanent: true },
      { source: '/clinical-quiz', destination: '/daily-challenge', permanent: true },
      { source: '/gallery', destination: '/workshops', permanent: true },
      { source: '/updates', destination: '/workshops', permanent: true },
      { source: '/visual-lab', destination: '/clinical-visual-atlas', permanent: true },
      { source: '/visual-lab/manual-therapy', destination: '/manual-therapy', permanent: true },
      { source: '/visual-lab/manual-therapy/:slug', destination: '/manual-therapy/regions/:slug', permanent: true },
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
          ...(process.env.PNA_PREVIEW_BUILD === 'true'
            ? [
                {
                  key: 'X-Robots-Tag',
                  value: 'noindex, nofollow',
                },
              ]
            : []),
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
// Set PNA_SKIP_CF_DEV=1 to run `next dev` without Cloudflare bindings (e.g. offline UI work).
if (process.env.NODE_ENV === 'development' && process.env.PNA_SKIP_CF_DEV !== '1') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
