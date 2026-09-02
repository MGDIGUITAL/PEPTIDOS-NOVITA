/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['qrhspijmfimjxemravyz.supabase.co'],
    unoptimized: false,
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          }
        ],
      },
    ];
  },
};
module.exports = nextConfig;
