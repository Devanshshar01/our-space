import { defineConfig } from 'eslint/config';
import nextPlugin from 'eslint-config-next';

export default defineConfig([
  ...nextPlugin,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
]);