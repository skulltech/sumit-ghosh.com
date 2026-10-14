import { defineConfig } from 'cf/config';

export default defineConfig({
  accountId: '7ab9bb06029cc272afd70a31787a92a8',
  worker: {
    name: 'sumit-ghosh-com',
    compatibilityDate: '2026-10-15',
    workersDev: true,
    domains: ['sumit-ghosh.com', 'www.sumit-ghosh.com'],
    assets: {
      htmlHandling: 'force-trailing-slash',
      notFoundHandling: '404-page',
    },
  },
});
