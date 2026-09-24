const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const config = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'nilabhsubramaniam.atlassian.net' },
    ],
  },

  async headers() {
    /* Next injects inline bootstrap scripts and React writes inline style
       attributes. A nonce would need per-request rendering via middleware;
       this site is statically prerendered, so 'unsafe-inline' is required
       for those two. Everything else is locked to same-origin, which still
       blocks third-party script and connection origins.
       'unsafe-eval' is added only in development, where HMR needs it. */
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://nilabhsubramaniam.atlassian.net",
      "font-src 'self' data:",
      "connect-src 'self'" + (isDev ? ' ws: http://localhost:*' : ''),
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        // Map geometry is large and changes rarely. Without this it is served
        // with `max-age=0, must-revalidate`, so every visit re-fetches it.
        source: '/(.*).geojson',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Content-Security-Policy',  value: csp },
          {
            /* Vercel serves HTTPS only; two years, subdomains included.
               `preload` is deliberately omitted — that list is hard to
               leave and should be an explicit decision. */
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          {
            key:   'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default config;
