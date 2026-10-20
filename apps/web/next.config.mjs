/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@infinity/ui'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

}

export default nextConfig
