/**
 * Crawlers that get page titles and meta tags in the <head> of the first HTML response
 * (Next.js otherwise streams them for pages rendered on request). Next's default list plus
 * Googlebot and the AI search crawlers, which do not wait for JavaScript.
 */
const DEFAULT_LIMITED_BOTS =
  '[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight';
const SEARCH_AND_AI_BOTS = 'Googlebot|GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-SearchBot|Claude-User|PerplexityBot|Perplexity-User|Amazonbot|CCBot';

/** @type {import('next').NextConfig} */
const nextConfig = {
  htmlLimitedBots: new RegExp(`${DEFAULT_LIMITED_BOTS}|${SEARCH_AND_AI_BOTS}`, 'i'),
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
      // Conditions & Treatment Guide (2026-11): MSK injuries + treatment plans merged; Knowledge Hub articles and the Clinical Arena retired.
      { source: '/treatment-plans/nonspecific-low-back-pain', destination: '/conditions/non-specific-low-back-pain', permanent: true },
      { source: '/treatment-plans/rotator-cuff-related-shoulder-pain', destination: '/conditions/rotator-cuff-tendinopathy', permanent: true },
      { source: '/treatment-plans/lateral-elbow-tendinopathy', destination: '/conditions/lateral-epicondylalgia', permanent: true },
      { source: '/treatment-plans/:slug', destination: '/conditions/:slug', permanent: true },
      { source: '/treatment-plans', destination: '/conditions', permanent: true },
      { source: '/msk-injuries/:slug', destination: '/conditions/:slug', permanent: true },
      { source: '/msk-injuries', destination: '/conditions', permanent: true },
      { source: '/knowledge-hub/:path*', destination: '/conditions', permanent: true },
      { source: '/knowledge-hub', destination: '/conditions', permanent: true },
      { source: '/clinical-arena', destination: '/case-lab', permanent: true },
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
