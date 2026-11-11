import type { WorkFeature } from '@internal/work/features/entrypoint'
import { icons } from '@/ui/icons'

export const feature: WorkFeature = {
  id: 'settings',
  label: 'Settings',
  path: 'settings',
  surface: 'shell',
  kind: 'focus',
  nav: {
    id: 'settings',
    label: 'Settings',
    to: '/settings',
    order: 20,
    icon: icons.settings,
    portals: ['work'],
  },
}
