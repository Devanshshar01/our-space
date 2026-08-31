import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'drizzle/**',
      'next-env.d.ts',
    ],
  },
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
];