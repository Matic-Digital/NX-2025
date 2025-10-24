export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    // CSS optimization for production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // Optimize CSS for better compression
          normalizeWhitespace: true,
          mergeLonghand: true,
          mergeRules: true,
          minifySelectors: true,
          // Critical CSS optimization
          reduceIdents: false, // Keep CSS custom properties intact
        }]
      }
    })
  },
};
