import type { FeatureNav, PageKind, Surface, WorkFeature } from '@internal/work/features/entrypoint'
import type { ComponentType } from 'react'
import { matchPath, type RouteObject } from 'react-router'
import type { CoachmarkPages, CoachmarkStep } from '@/ui/coachmark'

type EntrypointModule = { feature?: WorkFeature }
type PageModule = { Page: ComponentType }
type CoachmarkModule = { COACHMARKS?: CoachmarkPages }

const entrypoints = import.meta.glob<EntrypointModule>('./*/entrypoint.ts', { eager: true })
const pages = import.meta.glob<PageModule>('./*/page.tsx')
const coachmarkSources = import.meta.glob<CoachmarkModule>('./*/coachmarks.ts')

type CatalogEntry = { feature: WorkFeature; loadPage: () => Promise<PageModule> }

function fail(message: string): never {
  throw new Error(`[work features] ${message}`)
}

function collect(): readonly CatalogEntry[] {
  const entries = Object.entries(entrypoints).map(([file, mod]): CatalogEntry => {
    const folder = file.split('/')[1] ?? ''
    const feature = mod.feature ?? fail(`${folder}/entrypoint.ts must export 'feature'`)
    if (feature.id !== folder) fail(`${folder}/entrypoint.ts declares id '${feature.id}'`)
    const loadPage = pages[`./${folder}/page.tsx`] ?? fail(`${folder} has no page.tsx`)
    return { feature, loadPage }
  })
  const paths = entries.map((entry) => entry.feature.path)
  if (new Set(paths).size !== paths.length) fail('two work features declare the same path')
  return entries
}

const catalog = collect()

const routeOf = ({ feature, loadPage }: CatalogEntry): RouteObject => {
  const lazy = async () => ({ Component: (await loadPage()).Page })
  return feature.path === '' ? { index: true, lazy } : { path: feature.path, lazy }
}

export function featureRoutes(surface: Surface): RouteObject[] {
  return catalog.filter(({ feature }) => feature.surface === surface).map(routeOf)
}

export const navEntries: readonly FeatureNav[] = catalog
  .flatMap(({ feature }) => (feature.nav === undefined ? [] : [feature.nav]))
  .toSorted((a, b) => a.order - b.order)

const servesPath = (feature: WorkFeature, pathname: string) =>
  matchPath({ path: `/${feature.path}`, end: true }, pathname) !== null

export function pageKindAt(pathname: string): PageKind {
  return catalog.find(({ feature }) => servesPath(feature, pathname))?.feature.kind ?? 'fill'
}

const loadedPages = new Set<string>()

export function prefetchPage(to: string): void {
  const entry = catalog.find(({ feature }) => servesPath(feature, to))
  if (entry === undefined || loadedPages.has(entry.feature.id)) return
  const { id } = entry.feature
  loadedPages.add(id)
  entry.loadPage().catch(() => {
    loadedPages.delete(id)
  })
}

let loadedSteps: Promise<CoachmarkPages> | null = null

export function coachmarkSteps(): Promise<CoachmarkPages> {
  loadedSteps ??= Promise.all(Object.values(coachmarkSources).map((load) => load())).then(
    (modules) => {
      const steps: Record<string, readonly CoachmarkStep[]> = {}
      for (const module of modules) Object.assign(steps, module.COACHMARKS)
      return steps
    },
  )
  return loadedSteps
}
