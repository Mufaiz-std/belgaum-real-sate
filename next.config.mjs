/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow ngrok tunnel to access Next.js dev resources (HMR, etc.)
  allowedDevOrigins: ['marmalade-essence-bagged.ngrok-free.dev'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Unsplash blocks server-side fetch; mark as unoptimized to serve directly
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Prevents Next.js image optimizer from fetching Unsplash server-side
    // (Unsplash resets connections on automated requests causing 500 errors)
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['belgaumrealestate.in', 'localhost:3000', 'marmalade-essence-bagged.ngrok-free.dev'],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
