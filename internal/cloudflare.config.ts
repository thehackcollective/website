import { bindings, defineConfig } from 'cf/config'

const WORK_DB = { name: 'hack-collective-work', id: 'a6feccfd-24d4-4b6e-8109-62848796ff76' }

export default defineConfig({
  accountId: '191ce0f3febaf227407c1f816ab193e2',
  worker: {
    name: 'hack-collective-work',
    compatibilityDate: '2026-10-08',
    compatibilityFlags: ['nodejs_compat'],
    entrypoint: '../workers/internal/index.ts',
    workersDev: false,
    previewUrls: false,
    domains: ['work.hackcollective.uk'],
    observability: { enabled: true },
    assets: {
      notFoundHandling: 'single-page-application',
      runWorkerFirst: ['/api/*', '/version.json'],
    },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1(WORK_DB),
    },
  },
})
