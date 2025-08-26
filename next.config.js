/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js';

// Check if we're in a Docker environment
const isDocker = process.env.HOSTNAME === '0.0.0.0' || process.env.DOCKER === 'true';

/** @type {import('next').NextConfig} */

const nextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,
  devIndicators: false,

  // Source map configuration
  productionBrowserSourceMaps: false, // Disable in production for better performance

  // Development source maps are handled automatically by Next.js
  // Learn more here - https://nextjs.org/docs/advanced-features/compiler#module-transpilation
  // Required for UI css to be transpiled correctly 👇
  transpilePackages: ['jotai-devtools'],

  // Configure image domains for Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net'
      },
      {
        protocol: 'https',
        hostname: 'downloads.ctfassets.net'
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      },
      {
        protocol: 'https',
        hostname: 'air-prod.imgix.net'
      }
    ]
  },

  // Enable experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb'
    },
    // Optimize bundle splitting
    optimizePackageImports: ['@contentful/live-preview', 'gsap', 'lucide-react']
  },

  // Webpack optimizations for bundle splitting and CSS optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Bundle splitting optimizations
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Split vendor libraries into separate chunks
          contentful: {
            name: 'contentful',
            test: /[\\/]node_modules[\\/](@contentful)[\\/]/,
            chunks: 'all',
            priority: 30
          },
          gsap: {
            name: 'gsap',
            test: /[\\/]node_modules[\\/](gsap)[\\/]/,
            chunks: 'all',
            priority: 30
          },
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
            chunks: 'all',
            priority: 20
          },
          // Separate CSS into its own chunk for better caching
          styles: {
            name: 'styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'all',
            priority: 10,
            enforce: true
          }
        }
      };

      // CSS optimization is handled by PostCSS plugins and Next.js built-in optimization
    }
    return config;
  },

  // Skip static generation of error pages in Docker to avoid HTML conflicts
  skipTrailingSlashRedirect: isDocker,
  skipMiddlewareUrlNormalize: isDocker,

  // Disable specific ESLint rules for Docker builds
  eslint: {
    ignoreDuringBuilds: isDocker // Skip ESLint checks in Docker
  },

  // Disable type checking during build in Docker to reduce memory usage
  typescript: {
    ignoreBuildErrors: isDocker
  },

  // Security headers for Contentful live preview
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://app.contentful.com"
          }
        ]
      }
    ];
  },

  // Environment variable configuration
  env: {
    NEXT_PUBLIC_CONTENTFUL_SPACE_ID: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    // Set Docker environment variable to true for Docker builds
    DOCKER: isDocker ? 'true' : undefined
  }
};

export default nextConfig;
