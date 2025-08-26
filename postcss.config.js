const config = {
  plugins: [
    '@tailwindcss/postcss',
    // Only add autoprefixer in production - Next.js handles most CSS optimization
    ...(process.env.NODE_ENV === 'production' ? ['autoprefixer'] : [])
  ]
};

export default config;
