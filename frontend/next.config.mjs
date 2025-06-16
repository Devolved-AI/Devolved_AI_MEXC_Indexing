/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add experimental features for app router
  experimental: {
    appDir: true,
  },
  // Ensure proper client-side rendering
  reactStrictMode: true,
}

export default nextConfig
