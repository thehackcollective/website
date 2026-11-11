import { navEntries } from '@internal/work/features/catalog'
import type { FeatureNav } from '@internal/work/features/entrypoint'

export type NavItem = FeatureNav

const dockSize = 4

export const railItems: readonly NavItem[] = navEntries.filter(
  (item) => item.portals?.includes('work') ?? false,
)

export const accountItems: readonly NavItem[] = navEntries.filter(
  (item) => item.place === 'account',
)

export const dockItems: readonly NavItem[] = railItems.slice(0, dockSize)

export function isNavActive(item: NavItem, pathname: string): boolean {
  if (item.to === '/') return pathname === '/'
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function railPageAt(pathname: string): NavItem | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return railItems.find((item) => item.to === path) ?? null
}
