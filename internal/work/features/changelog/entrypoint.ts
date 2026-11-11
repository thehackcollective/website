import type { WorkFeature } from '@internal/work/features/entrypoint'
import { icons } from '@/ui/icons'

export const feature: WorkFeature = {
  id: 'changelog',
  label: 'Changelog',
  path: 'changelog',
  surface: 'shell',
  kind: 'focus',
  nav: {
    id: 'changelog',
    label: 'Changelog',
    to: '/changelog',
    order: 90,
    icon: icons.changelog,
    place: 'account',
  },
}
