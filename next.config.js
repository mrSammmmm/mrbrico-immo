/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Optimisation pour la production
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
