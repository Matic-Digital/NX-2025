/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: true,
  singleQuote: true,
  arrowParens: 'always',
  trailingComma: 'none',
  printWidth: 100,
  tabWidth: 2,
  bracketSpacing: true,
  plugins: ['prettier-plugin-tailwindcss', '@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^react$',
    '^next$',
    '<THIRD_PARTY_MODULES>',
    '',
    'lucide-react',
    '',
    '@/styles/*',
    '',
    '^@/lib/*',
    '',
    '@/hooks/*',
    '',
    '@/contexts/*',
    '',
    '@/components/ui',
    '',
    '@/components/global',
    '',
    '^@/components/*',
    '',
    '<TYPES>'
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  importOrderCaseSensitive: false
};

export default config;
