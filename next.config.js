/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
