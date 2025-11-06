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
  
  // Disable ESLint during builds to prevent type conflicts
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Source map configuration
  // Disable source maps in production for security (prevent information disclosure)
  // Can be enabled for debugging by setting ENABLE_SOURCE_MAPS=true environment variable
  productionBrowserSourceMaps: process.env.ENABLE_SOURCE_MAPS === 'true',

  // Enable compression
  compress: true,

  // Optimize output - disable standalone for better asset handling
  // output: 'standalone',

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
    ],
    // Add quality levels to prevent Next.js 16 warnings
    qualities: [50, 60, 75, 90, 100]
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
    // Disable CSS optimization to prevent MIME type issues
    optimizeCss: false,
    // Disable CSS chunking completely to prevent MIME type issues
    cssChunking: false,
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
    if (!dev && !isServer && process.env.ENABLE_SOURCE_MAPS === 'true') {
      // Use 'source-map' for production builds to generate separate .map files
      // Only when explicitly enabled for debugging purposes
      config.devtool = 'source-map';
    } else if (!dev && !isServer) {
      // Disable source maps in production for security
      config.devtool = false;
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
          // Disable CSS splitting to prevent MIME type issues
          // criticalStyles: {
          //   name: 'critical-styles',
          //   test: /\.(css|scss|sass)$/,
          //   chunks: 'initial',
          //   priority: 20,
          //   enforce: true,
          //   reuseExistingChunk: true,
          //   // Only include critical CSS in initial chunk
          //   minSize: 0,
          //   maxSize: 20000 // Reduced to 20KB for faster critical CSS loading
          // },
          // asyncStyles: {
          //   name: 'async-styles',
          //   test: /\.(css|scss|sass)$/,
          //   chunks: 'async',
          //   priority: 5,
          //   enforce: true,
          //   reuseExistingChunk: true
          // },
          // Split Tailwind CSS separately for better caching
          // tailwindStyles: {
          //   name: 'tailwind-styles',
          //   test: /node_modules\/(tailwindcss|@tailwindcss)/,
          //   chunks: 'all',
          //   priority: 25,
          //   enforce: true,
          //   reuseExistingChunk: true
          // }
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
          // Content Security Policy - Configured for Mux Video Support
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' ? [
              // Development CSP - Mux optimized + required domains
              "default-src 'self'",
              "connect-src 'self' https://*.mux.com https://*.litix.io https://storage.googleapis.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https: wss:",
              "media-src 'self' blob: https://*.mux.com",
              "img-src 'self' data: blob: https: https://image.mux.com https://*.litix.io https://images.ctfassets.net https://downloads.ctfassets.net https://air-prod.imgix.net",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://src.litix.io https://vercel.live https://app.contentful.com https://www.googletagmanager.com https://www.google-analytics.com https://googletagmanager.com https://ssl.google-analytics.com https://tagmanager.google.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://*.mux.com https://app.contentful.com https://vercel.live",
              "frame-ancestors 'self' https://app.contentful.com https://vercel.live"
            ].join('; ') : [
              // Production CSP - Mux optimized + required domains
              "default-src 'self'",
              "connect-src 'self' https://*.mux.com https://*.litix.io https://storage.googleapis.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https: wss:",
              "media-src 'self' blob: https://*.mux.com",
              "img-src 'self' data: blob: https: https://image.mux.com https://*.litix.io https://images.ctfassets.net https://downloads.ctfassets.net https://air-prod.imgix.net",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://src.litix.io https://vercel.live https://app.contentful.com https://www.googletagmanager.com https://www.google-analytics.com https://googletagmanager.com https://ssl.google-analytics.com https://tagmanager.google.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://*.mux.com https://app.contentful.com https://vercel.live",
              "frame-ancestors 'self' https://app.contentful.com https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
              "report-uri /api/csp-report"
            ].join('; ')
          },
          // Report-To header for CSP violation reporting
          {
            key: 'Report-To',
            value: JSON.stringify({
              group: 'csp-endpoint',
              max_age: 10886400,
              endpoints: [{ url: '/api/csp-report' }]
            })
          },
          // Security Headers - OWASP ASVS Level 1 Compliance
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'bluetooth=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()'
            ].join(', ')
          },
          // Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
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

  // Environment variable configuration - Server-only variables (no NEXT_PUBLIC_ for security)
  // Contentful credentials are now server-only and not exposed to client
};

export default withBundleAnalyzer(nextConfig);
