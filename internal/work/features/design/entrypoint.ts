import type { WorkFeature } from '@internal/work/features/entrypoint'
import { icons } from '@/ui/icons'

export const feature: WorkFeature = {
  id: 'design',
  label: 'Design',
  path: 'design',
  surface: 'shell',
  nav: {
    id: 'design',
    label: 'Design',
    to: '/design',
    order: 10,
    icon: icons.display,
    portals: ['work'],
  },
}
