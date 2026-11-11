import type { WorkFeature } from '@internal/work/features/entrypoint'
import { icons } from '@/ui/icons'

export const feature: WorkFeature = {
  id: 'home',
  label: 'Home',
  path: '',
  surface: 'shell',
  nav: { id: 'home', label: 'Home', to: '/', order: 0, icon: icons.home, portals: ['work'] },
}
