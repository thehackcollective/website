import type { WorkFeature } from '@internal/work/features/entrypoint'
import { icons } from '@/ui/icons'

export const feature: WorkFeature = {
  id: 'people',
  label: 'People',
  path: 'people',
  surface: 'shell',
  nav: {
    id: 'people',
    label: 'People',
    to: '/people',
    order: 5,
    icon: icons.person,
    portals: ['work'],
  },
}
