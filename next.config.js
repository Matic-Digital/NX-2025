/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
import './src/env.js';

import bundleAnalyzer from '@next/bundle-analyzer';

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
  // Enable source maps in production for better debugging and Lighthouse insights
  // Can be disabled by setting DISABLE_SOURCE_MAPS=true environment variable
  productionBrowserSourceMaps: process.env.DISABLE_SOURCE_MAPS !== 'true',

  // Enable compression
  compress: true,

  // Optimize output
  output: 'standalone',

  // Performance optimizations for faster server response
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: true, // Enable ETags for better caching
  
  // Optimize page generation
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

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
    // Optimize bundle splitting for main-thread performance
    optimizePackageImports: [
      '@contentful/live-preview', 
      'gsap', 
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@tanstack/react-query'
    ],
    // Enable CSS optimization
    optimizeCss: true,
    // Enable aggressive CSS code splitting
    cssChunking: 'strict',
    // Enable critical CSS extraction
    optimizeServerReact: true,
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: ['@contentful/rich-text-react-renderer'],

  // SWC compiler options for enhanced minification (swcMinify is now default)
  compiler: {
    // Remove React properties in production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
    // Enable emotion for better CSS-in-JS performance (if used)
    emotion: true,
  },

  // Additional optimizations
  modularizeImports: {
    // Tree shake lodash imports
    'lodash': {
      transform: 'lodash/{{member}}',
    },
    // Tree shake @radix-ui imports
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}.js',
      preventFullImport: true,
    }
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
    // Configure source map generation for production
    if (!dev && !isServer && process.env.DISABLE_SOURCE_MAPS !== 'true') {
      // Use 'source-map' for production builds to generate separate .map files
      // This provides full source maps without increasing the main bundle size
      config.devtool = 'source-map';
    }

    if (!dev && !isServer) {
      // Bundle splitting optimizations
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Core React - highest priority for caching
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            chunks: 'all',
            priority: 50,
            reuseExistingChunk: true,
            enforce: true
          },
          // Heavy animation libraries - separate chunk
          animations: {
            name: 'animations',
            test: /[\\/]node_modules[\\/](framer-motion|motion|@lottiefiles|gsap)[\\/]/,
            chunks: 'async',
            priority: 35,
            reuseExistingChunk: true,
            enforce: true
          },
          // Contentful - separate chunk for CMS functionality
          contentful: {
            name: 'contentful',
            test: /[\\/]node_modules[\\/](@contentful|contentful)[\\/]/,
            chunks: 'async',
            priority: 30,
            reuseExistingChunk: true,
            enforce: true
          },
          // TanStack libraries - only load when forms are used
          tanstack: {
            name: 'tanstack',
            test: /[\\/]node_modules[\\/](@tanstack)[\\/]/,
            chunks: 'async',
            priority: 25,
            reuseExistingChunk: true,
            enforce: true
          },
          // Radix UI components - load async only when used
          radixUI: {
            name: 'radix-ui',
            test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
            chunks: 'async',
            priority: 22,
            reuseExistingChunk: true,
            enforce: true
          },
          // Embla Carousel - load async only when carousels are used
          emblaCarousel: {
            name: 'embla-carousel',
            test: /[\\/]node_modules[\\/](embla-carousel)[\\/]/,
            chunks: 'async',
            priority: 21,
            reuseExistingChunk: true,
            enforce: true
          },
          // Lucide icons - keep smaller priority
          lucideIcons: {
            name: 'lucide-icons',
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            chunks: 'async',
            priority: 18,
            reuseExistingChunk: true,
            enforce: true
          },
          // PDF and media libraries - heavy, load async
          media: {
            name: 'media',
            test: /[\\/]node_modules[\\/](react-pdf|@mux)[\\/]/,
            chunks: 'async',
            priority: 15,
            reuseExistingChunk: true,
            enforce: true
          },
          // Split CSS into critical and non-critical chunks
          criticalStyles: {
            name: 'critical-styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'initial',
            priority: 20,
            enforce: true,
            reuseExistingChunk: true,
            // Only include critical CSS in initial chunk
            minSize: 0,
            maxSize: 20000 // Reduced to 20KB for faster critical CSS loading
          },
          asyncStyles: {
            name: 'async-styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'async',
            priority: 5,
            enforce: true,
            reuseExistingChunk: true
          },
          // Split Tailwind CSS separately for better caching
          tailwindStyles: {
            name: 'tailwind-styles',
            test: /node_modules\/(tailwindcss|@tailwindcss)/,
            chunks: 'all',
            priority: 25,
            enforce: true,
            reuseExistingChunk: true
          }
        }
      };

      // Additional optimizations to reduce main-thread work
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Enhanced JavaScript minification
      if (config.optimization.minimizer) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Webpack minimizer plugins have complex types
        config.optimization.minimizer.forEach(/** @param {any} minimizer */ (minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions?.compress,
                // Basic optimizations
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                // Advanced compression
                dead_code: true,
                drop_unreachable: true,
                evaluate: true,
                inline: 2,
                join_vars: true,
                loops: true,
                passes: 2,
                reduce_vars: true,
                sequences: true,
                side_effects: false,
                unused: true,
                // Remove comments
                comments: false
              },
              mangle: {
                ...minimizer.options.terserOptions?.mangle,
                safari10: true,
                // Enhanced mangling
                properties: {
                  regex: /^_/
                }
              },
              format: {
                comments: false
              }
            };
          }
        });
      }

      // Additional minification for development mode
      if (dev) {
        config.optimization.minimize = true;
        config.optimization.minimizer = [
          ...config.optimization.minimizer || [],
          new (require('terser-webpack-plugin'))({
            terserOptions: {
              compress: {
                drop_console: false, // Keep console in dev
                drop_debugger: false,
                passes: 1 // Faster compilation in dev
              },
              mangle: false, // Don't mangle in dev for debugging
              format: {
                comments: false
              }
            }
          })
        ];
      }

      // CSS optimization is handled by PostCSS plugins and Next.js built-in optimization
    }
    return config;
  },


  // Performance and security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.contentful.com https://cdn.jsdelivr.net https://unpkg.com https://js.hsforms.net https://js.hs-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https:; connect-src 'self' https: wss: https://api.hubapi.com; frame-ancestors 'self' https://app.contentful.com; base-uri 'self'; form-action 'self' https://api.hubapi.com; object-src 'none'; upgrade-insecure-requests"
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      },
      {
        // Static assets caching
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // API routes caching
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600'
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
      process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN
  }
};

export default withBundleAnalyzer(nextConfig);
