import type { WorkFeature } from '@internal/work/features/entrypoint'

export const feature: WorkFeature = {
  id: 'auth',
  label: 'Sign in',
  path: 'login',
  surface: 'bare',
}
