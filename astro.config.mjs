import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sumit-ghosh.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      langAlias: { python3: 'python', terminal: 'shell', xpath: 'text' },
    },
  },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') && !page.includes('/articles/') })],
});
