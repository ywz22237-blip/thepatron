/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@thepatron/ui', '@thepatron/utils', '@thepatron/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
