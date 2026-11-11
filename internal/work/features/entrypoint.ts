import type { IconSvgElement } from '@hugeicons/react'

export type PageKind = 'fill' | 'focus'

export type Surface = 'shell' | 'bare'

type Portal = 'work'

type NavPlace = 'account'

interface NavBase {
  id: string
  label: string
  to: string
  order: number
  icon: IconSvgElement
}

export type FeatureNav = NavBase &
  ({ portals: readonly Portal[]; place?: never } | { place: NavPlace; portals?: never })

export interface WorkFeature {
  id: string
  label: string
  path: string
  surface: Surface
  kind?: PageKind
  nav?: FeatureNav
}
