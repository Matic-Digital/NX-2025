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

  // Learn more here - https://nextjs.org/docs/advanced-features/compiler#module-transpilation
  // Required for UI css to be transpiled correctly 👇
  transpilePackages: ['jotai-devtools'],

  // Add security headers for Contentful live preview
  async headers() {
    // Check if we're in a preview environment on Vercel
    // VERCEL_ENV will be 'production', 'preview', or 'development'
    const isPreviewEnv = process.env.VERCEL_ENV === 'prod-preview' || process.env.VERCEL_ENV === 'preview';
    
    // Only add special headers for preview environments
    if (isPreviewEnv) {
      return [
        {
          // Apply to all routes
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              // Allow embedding from Contentful domains
              value: "frame-ancestors 'self' https://*.contentful.com https://app.contentful.com;"
            },
            {
              // Remove X-Frame-Options header entirely and rely on CSP instead
              // This is more widely supported across browsers
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            }
          ]
        }
      ];
    }
    
    // Return empty array for non-preview environments
    return [];
  },

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
    }
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
