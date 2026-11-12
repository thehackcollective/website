import type { D1Database, Fetcher } from '@cloudflare/workers-types'

export interface Env {
  ASSETS: Fetcher
  DB: D1Database
  CLERK_SECRET_KEY?: string
}
