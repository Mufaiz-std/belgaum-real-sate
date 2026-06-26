/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow ngrok tunnel to access Next.js dev resources (HMR, etc.)
  allowedDevOrigins: ['choreatic-unsombre-winnifred.ngrok-free.dev'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Unsplash blocks server-side fetch; mark as unoptimized to serve directly
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Enable optimization globally (e.g., for Cloudinary).
    // Note: Unsplash images must be marked unoptimized directly in components
    // to prevent server-side fetch connection reset (500) errors.
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['xcityrealestate.com', 'www.xcityrealestate.com', 'belgaumrealestate.in', 'localhost:3000', 'choreatic-unsombre-winnifred.ngrok-free.dev'],
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
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
