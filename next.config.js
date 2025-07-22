/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minifier for better performance
  swcMinify: true,
  
  // Optimize images from these domains
  images: {
    domains: [
      'api.mapbox.com',
      'tiles.mapbox.com',
      'mapbox.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables that should be available on the client side
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Webpack configuration for optimal builds
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js'
      }
    }
    
    return config
  },
  
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
