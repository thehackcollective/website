import type { AlignBox } from './align-page'

export interface AlignComponent {
  id: string
  kind: 'component' | 'clickable-bound' | 'clickable-gap'
  box: AlignBox
  identity: string
  parentId: string | null
  reasons: string[]
}

export function extractComponents(): AlignComponent[] {
  const media = 'img,svg,picture,video,canvas,iframe,object,embed'
  const norm = (value: string | null) => (value ?? '').replace(/\s+/g, ' ').trim()
  const visibleBox = (element: Element): AlignBox | null => {
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      rect.width <= 0 ||
      rect.height <= 0
    )
      return null
    let { left, right, top, bottom } = rect
    let parent = element.parentElement
    while (parent !== null && parent !== document.documentElement) {
      const css = getComputedStyle(parent)
      if (css.display !== 'contents') {
        const bounds = parent.getBoundingClientRect()
        if (/(hidden|clip|scroll|auto)/.test(css.overflowX)) {
          left = Math.max(left, bounds.left)
          right = Math.min(right, bounds.right)
        }
        if (/(hidden|clip|scroll|auto)/.test(css.overflowY)) {
          top = Math.max(top, bounds.top)
          bottom = Math.min(bottom, bounds.bottom)
        }
      }
      parent = parent.parentElement
    }
    left = Math.max(0, left)
    right = Math.min(document.documentElement.clientWidth, right)
    top = Math.max(0, top)
    bottom = Math.min(innerHeight, bottom)
    return right > left && bottom > top ? { left, right, top, bottom } : null
  }
  const identityOf = (element: Element) => {
    const parts: string[] = []
    let current: Element | null = element
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
    return parts.join(' > ')
  }
  const fingerprint = (element: Element) =>
    [
      element.tagName,
      element.getAttribute('role') ?? '',
      Array.from(element.querySelectorAll('h1,h2,h3,h4'))
        .map((node) => norm(node.textContent))
        .join(' • '),
      norm(element.textContent).slice(0, 200),
      Array.from(element.querySelectorAll('img'))
        .map((node) => node.getAttribute('src') ?? node.alt)
        .join('|'),
      Array.from(element.querySelectorAll('a[href]'))
        .map((node) => node.getAttribute('href'))
        .join('|'),
    ].join('||')
  const seen = new Map<string, number>()
  const keyOf = (element: Element, prefix: string) => {
    let hash = 2166136261
    for (const character of fingerprint(element))
      hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
    const base = `${prefix}-${(hash >>> 0).toString(36)}`
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}#${count + 1}`
  }
  const candidates = new Map<Element, Set<string>>()
  const add = (element: Element, reason: string) => {
    if (element.closest('[data-align-overlay],[data-align-skeleton]')) return
    const reasons = candidates.get(element) ?? new Set<string>()
    reasons.add(reason)
    candidates.set(element, reasons)
  }
  for (const element of Array.from(
    document.querySelectorAll(
      'main,aside,nav,header,footer,section,article,li,[role="list"],[role="grid"]',
    ),
  ))
    add(element, 'semantic')
  for (const container of Array.from(
    document.querySelectorAll('ul,ol,div,section,main,nav,aside'),
  )) {
    if (visibleBox(container) === null) continue
    const children = Array.from(container.children).filter((child) => visibleBox(child) !== null)
    const groups = new Map<string, Element[]>()
    for (const child of children) {
      const key = `${child.tagName}:${child.getAttribute('role') ?? ''}`
      const group = groups.get(key) ?? []
      group.push(child)
      groups.set(key, group)
    }
    for (const group of groups.values())
      if (group.length >= 3) for (const child of group) add(child, 'repeated-sibling')
    if (!/(grid|flex)/.test(getComputedStyle(container).display)) continue
    const cells = children.filter((child) => {
      const rect = visibleBox(child)
      return rect !== null && rect.right - rect.left >= 80 && rect.bottom - rect.top >= 40
    })
    if (cells.length >= 2) for (const child of cells) add(child, 'grid-cell')
  }
  const roots: Array<{ element: Element; component: AlignComponent; area: number }> = []
  for (const [element, reasons] of candidates) {
    const box = visibleBox(element)
    if (box === null || box.right - box.left < 80 || box.bottom - box.top < 28) continue
    if (
      norm(element.textContent).length < 8 &&
      element.querySelector(media) === null &&
      norm(element.getAttribute('aria-label')).length < 3
    )
      continue
    const area = (box.right - box.left) * (box.bottom - box.top)
    if (
      roots.some(
        (root) =>
          (root.element.contains(element) || element.contains(root.element)) &&
          Math.min(root.area, area) / Math.max(root.area, area) > 0.92,
      )
    )
      continue
    roots.push({
      element,
      area,
      component: {
        id: keyOf(element, 'comp'),
        kind: 'component',
        box,
        identity: identityOf(element),
        parentId: null,
        reasons: [...reasons],
      },
    })
  }
  const ownerOf = (element: Element, self: boolean) =>
    roots
      .filter((root) => (self || root.element !== element) && root.element.contains(element))
      .sort((a, b) => a.area - b.area)[0]
  for (const root of roots)
    root.component.parentId = ownerOf(root.element, false)?.component.id ?? null
  const components = roots.map((root) => root.component)
  for (const element of Array.from(
    document.querySelectorAll(
      'a[href],button,input,select,textarea,[role="button"],[role="link"],[role="tab"]',
    ),
  )) {
    const box = visibleBox(element)
    if (box === null) continue
    const owner = ownerOf(element, true)
    components.push({
      id: keyOf(element, 'click'),
      kind: owner === undefined ? 'clickable-gap' : 'clickable-bound',
      box,
      identity: identityOf(element),
      parentId: owner?.component.id ?? null,
      reasons: [],
    })
  }
  return components
}
