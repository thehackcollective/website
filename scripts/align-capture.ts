import type { AlignComponent } from './align-components'
import type { AlignBox, AlignFinding } from './align-page'

export type { AlignComponent } from './align-components'

export interface AlignFrame {
  step: number
  scrollY: number
  viewport: { width: number; height: number }
  dpr: number
  regions?: { sidebar: AlignBox | null; main: AlignBox | null }
  components?: AlignComponent[]
}

export interface ScoredFinding extends AlignFinding, AlignFrame {
  id: string
  identity: { a: string; b: string | null }
  noiseScore: number
  noiseReason: string
}

export interface AlignScreenshot extends AlignFrame {
  clean: string
  skeleton: string
  guides: string
  fullClean?: string | undefined
  fullSkeleton?: string | undefined
}

export interface ViewerPage {
  path: string
  width: number
  scale: number
  screenshots: AlignScreenshot[]
  findings: ScoredFinding[]
  rhythm?: ScoredFinding[]
}

export function frameInfo(step: number): AlignFrame {
  const scrollers = Array.from(document.querySelectorAll('*')).filter(
    (element) => element.scrollTop > 0,
  )
  const region = (selector: string): AlignBox | null => {
    const rect = document.querySelector(selector)?.getBoundingClientRect()
    if (rect === undefined) return null
    return {
      left: Math.max(0, rect.left),
      right: Math.min(innerWidth, rect.right),
      top: Math.max(0, rect.top),
      bottom: Math.min(innerHeight, rect.bottom),
    }
  }
  return {
    step,
    scrollY: Math.max(window.scrollY, ...scrollers.map((element) => element.scrollTop)),
    viewport: { width: innerWidth, height: innerHeight },
    dpr: devicePixelRatio,
    regions: { sidebar: region('aside'), main: region('main') },
  }
}

export function scoreFindings(findings: AlignFinding[]) {
  const identityOf = (selector: string): string => {
    const node = document.querySelector(selector.split('::text')[0] ?? '')
    const parts: string[] = []
    let current = node
    while (current !== null && current !== document.body) {
      const tag = current.tagName.toLowerCase()
      const siblings = Array.from(current.parentElement?.children ?? []).filter(
        (child) => child.tagName === current?.tagName,
      )
      const slot = current.getAttribute('data-slot')
      parts.unshift(
        `${tag}${slot ? `[data-slot="${slot}"]` : ''}${siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : ''}`,
      )
      current = current.parentElement
    }
    const text = selector.includes('::text') ? selector.slice(selector.indexOf('::text')) : ''
    return parts.join(' > ') + text
  }
  return findings
    .map((finding) => {
      const identity = {
        a: identityOf(finding.a.selector),
        b: finding.b === null ? null : identityOf(finding.b.selector),
      }
      return { ...finding, id: '', identity }
    })
    .map((finding) => {
      if (finding.check === 'fractional')
        return { ...finding, noiseScore: 0.1, noiseReason: 'Subpixel placement' }
      if (finding.b === null || finding.check === 'hit-target')
        return { ...finding, noiseScore: 0.1, noiseReason: 'Control geometry' }
      const element = (selector: string) =>
        document.querySelector(selector.split('::text')[0] ?? '')
      const a = element(finding.a.selector)
      const b = element(finding.b.selector)
      if (a === null || b === null)
        return { ...finding, noiseScore: 0.8, noiseReason: 'Unresolved pair' }
      const region = (node: Element) => node.closest('main, aside, nav, header, footer')
      if (region(a) !== region(b))
        return { ...finding, noiseScore: 1, noiseReason: 'Separate page regions' }
      if (a.parentElement === b.parentElement || a.contains(b) || b.contains(a))
        return { ...finding, noiseScore: 0.05, noiseReason: 'Same local group' }
      const shape = (selector: string) => selector.replace(/:nth-(?:child|of-type)\(\d+\)/g, '')
      if (shape(finding.a.selector) === shape(finding.b.selector))
        return { ...finding, noiseScore: 0.15, noiseReason: 'Repeated group' }
      let ancestor: Element | null = a
      let distance = 0
      while (ancestor !== null && !ancestor.contains(b)) {
        ancestor = ancestor.parentElement
        distance += 1
      }
      const textControl =
        finding.a.selector.includes('::text') !== finding.b.selector.includes('::text')
      const noiseScore = Math.min(1, distance * 0.18 + (textControl ? 0.3 : 0))
      return {
        ...finding,
        noiseScore,
        noiseReason: `Common ancestor ${distance} levels up${textControl ? '; text versus box' : ''}`,
      }
    })
}

export function skeletonMode(enabled: boolean): void {
  document.querySelector('[data-align-skeleton]')?.remove()
  if (!enabled) return
  const layer = document.createElement('div')
  layer.dataset.alignSkeleton = ''
  const style = document.createElement('style')
  style.textContent =
    'body {background:#f2f2f2!important} body :not([data-align-skeleton],[data-align-skeleton] *,[data-align-overlay],[data-align-overlay] *) {color:transparent!important;text-shadow:none!important;caret-color:transparent!important;background-color:transparent!important;border-color:transparent!important;box-shadow:none!important;outline-color:transparent!important} img,svg,video,canvas {visibility:hidden!important} input::placeholder,textarea::placeholder {color:transparent!important}'
  const add = (rect: DOMRect, color: string) => {
    if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > innerHeight) return
    const bar = document.createElement('div')
    bar.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;background:${color};border-radius:3px;pointer-events:none`
    layer.append(bar)
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node !== null) {
    const parent = node.parentElement
    if (
      node.textContent?.trim() &&
      parent !== null &&
      !parent.closest('script,style,noscript') &&
      getComputedStyle(parent).visibility !== 'hidden'
    ) {
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of Array.from(range.getClientRects())) add(rect, '#d2d2d2')
    }
    node = walker.nextNode()
  }
  for (const media of Array.from(document.querySelectorAll('img,svg,video,canvas,input,textarea')))
    add(media.getBoundingClientRect(), '#dedede')
  layer.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none'
  layer.append(style)
  document.body.append(layer)
}
