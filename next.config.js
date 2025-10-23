/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js';

import bundleAnalyzer from '@next/bundle-analyzer';

// Check if we're in a Docker environment
const isDocker = process.env.HOSTNAME === '0.0.0.0' || process.env.DOCKER === 'true';

// Bundle analyzer configuration
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */

const nextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,
  devIndicators: false,

  // Source map configuration
  productionBrowserSourceMaps: false, // Disable in production for better performance

  // Enable compression
  compress: true,

  // Optimize output
  output: 'standalone',

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
    optimizePackageImports: ['@contentful/live-preview', 'gsap', 'lucide-react'],
    // Enable CSS optimization
    optimizeCss: true,
    // Enable aggressive CSS code splitting
    cssChunking: 'strict'
  },

  // Turbopack configuration (now stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
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
            priority: 30,
            reuseExistingChunk: true
          },
          gsap: {
            name: 'gsap',
            test: /[\\/]node_modules[\\/](gsap)[\\/]/,
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true
          },
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true
          },
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            chunks: 'all',
            priority: 40,
            reuseExistingChunk: true
          },
          // Split CSS into critical and non-critical chunks
          criticalStyles: {
            name: 'critical-styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'initial',
            priority: 15,
            enforce: true,
            reuseExistingChunk: true,
            // Only include critical CSS in initial chunk
            minSize: 0,
            maxSize: 50000 // 50KB limit for critical CSS
          },
          asyncStyles: {
            name: 'async-styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'async',
            priority: 10,
            enforce: true,
            reuseExistingChunk: true
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

  // Dynamic redirects based on routing cache
  async redirects() {
    try {
      // Import fs to read the redirects JSON file directly
      const fs = await import('fs');
      const path = await import('path');

      // Read the generated redirects file
      const redirectsPath = path.join(process.cwd(), 'src/lib/route-redirects.json');

      if (fs.existsSync(redirectsPath)) {
        const redirectsData = fs.readFileSync(redirectsPath, 'utf8');
        const redirects = JSON.parse(redirectsData);

        console.log(`🔀 Loaded ${redirects.length} dynamic redirects`);

        return redirects;
      } else {
        console.warn('⚠️ Redirects file not found, run sitemap:routing first');
        return [];
      }
    } catch (error) {
      console.warn('⚠️ Failed to load dynamic redirects:', error);
      return [];
    }
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

export default withBundleAnalyzer(nextConfig);
