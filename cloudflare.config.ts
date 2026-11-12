import { defineConfig } from 'cf/config'

export default defineConfig({
  accountId: '191ce0f3febaf227407c1f816ab193e2',
  worker: {
    name: 'website',
    compatibilityDate: '2026-10-08',
    workersDev: false,
    previewUrls: false,
    domains: ['hackcollective.uk', 'www.hackcollective.uk'],
    assets: {
      notFoundHandling: 'single-page-application',
    },
  },
})
