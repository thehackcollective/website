import type { WorkFeature } from '@internal/work/features/entrypoint'

export const feature: WorkFeature = {
  id: 'person',
  label: 'Person',
  path: 'people/:id',
  surface: 'shell',
  kind: 'focus',
}
