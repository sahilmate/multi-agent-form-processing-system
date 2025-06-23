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
  async rewrites() {
    return [
      {
        source: '/process-form',
        destination: 'http://localhost:8000/process-form',
      },
      {
        source: '/api/logs',
        destination: 'http://localhost:8000/api/logs',
      },
      {
        source: '/submit-text',
        destination: 'http://localhost:8000/submit-text',
      }
    ]
  },
}

export default nextConfig
