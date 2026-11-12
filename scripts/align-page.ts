export interface AlignLimits {
  nearMin: number
  nearMax: number
  iconTextMax: number
  columnGap: number
  iconTextGap: number
  hitTarget: number
}

export interface AlignBox {
  left: number
  top: number
  right: number
  bottom: number
}

export interface AlignSide {
  selector: string
  box: AlignBox
}

export interface AlignGuide {
  axis: 'x' | 'y'
  at: number
  from: number
  to: number
}

export interface AlignFinding {
  check: 'row' | 'column' | 'icon-text' | 'fractional' | 'hit-target' | 'spacing' | 'rhythm'
  edge: string
  a: AlignSide
  b: AlignSide | null
  delta: number
  guides: AlignGuide[]
  measurements?: { actual: number; expected: number; values: number[] }
  rhythm?: { group: string; column: string; onTokenScale: boolean }
}

export async function settlePage(): Promise<void> {
  await document.fonts.ready
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

export function pageProblem(): string {
  if (document.title.startsWith('Không tìm thấy trang')) return 'The path shows the not-found page.'
  if (document.querySelector('main') === null) return 'The page has no main element.'
  return ''
}

export function scrollToStep(input: { step: number; maxSteps: number }): number {
  let scroller: Element = document.scrollingElement ?? document.documentElement
  let room = scroller.scrollHeight - scroller.clientHeight
  for (const element of Array.from(
    document.querySelectorAll('main, main *, body > div, body > div > div'),
  )) {
    const overflow = getComputedStyle(element).overflowY
    if (overflow !== 'auto' && overflow !== 'scroll') continue
    const extra = element.scrollHeight - element.clientHeight
    if (extra > room + 1) {
      scroller = element
      room = extra
    }
  }
  scroller.scrollTop = input.step * scroller.clientHeight
  if (room <= 1) return 1
  return Math.min(input.maxSteps, Math.ceil(scroller.scrollHeight / scroller.clientHeight))
}

export function measureAlignment(limits: AlignLimits): AlignFinding[] {
  type Kind = 'icon' | 'image' | 'control' | 'text'
  interface Item {
    kind: Kind
    selector: string
    box: AlignBox
    owner: Element
    textNode: Text | null
  }

  const viewWidth = window.innerWidth
  const viewHeight = window.innerHeight
  const ratio = window.devicePixelRatio
  const findings: AlignFinding[] = []
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  const round = (value: number): number => Math.round(value * 100) / 100

  const boxOf = (rect: DOMRect): AlignBox => ({
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
  })

  const clips = new Map<Element, AlignBox>()
  const clipOf = (element: Element): AlignBox => {
    const known = clips.get(element)
    if (known !== undefined) return known
    const parent = element.parentElement
    let clip: AlignBox =
      parent === null ? { left: 0, top: 0, right: viewWidth, bottom: viewHeight } : clipOf(parent)
    if (parent !== null) {
      const style = getComputedStyle(parent)
      if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
        const rect = parent.getBoundingClientRect()
        const left = rect.left + parent.clientLeft
        const top = rect.top + parent.clientTop
        clip = {
          left: Math.max(clip.left, left),
          top: Math.max(clip.top, top),
          right: Math.min(clip.right, left + parent.clientWidth),
          bottom: Math.min(clip.bottom, top + parent.clientHeight),
        }
      }
    }
    clips.set(element, clip)
    return clip
  }

  const onScreen = (element: Element, box: AlignBox): boolean => {
    const clip = clipOf(element)
    return (
      box.right - box.left >= 1 &&
      box.bottom - box.top >= 1 &&
      box.bottom > clip.top &&
      box.right > clip.left &&
      box.top < clip.bottom &&
      box.left < clip.right
    )
  }

  const visible = (element: Element): boolean =>
    element.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
      contentVisibilityAuto: true,
    })

  const segmentOf = (element: Element): string => {
    const tag = element.tagName.toLowerCase()
    if (element.id !== '') return `${tag}#${CSS.escape(element.id)}`
    const slot = element.getAttribute('data-slot')
    const slotPart = slot === null ? '' : `[data-slot="${slot}"]`
    const parent = element.parentElement
    if (parent === null) return `${tag}${slotPart}`
    const same = Array.from(parent.children).filter((child) => child.tagName === element.tagName)
    const nth = same.length > 1 ? `:nth-of-type(${same.indexOf(element) + 1})` : ''
    return `${tag}${slotPart}${nth}`
  }

  const selectorOf = (element: Element): string => {
    const parts: string[] = []
    let current: Element | null = element
    while (current !== null && current !== document.body && parts.length < 5) {
      const segment = segmentOf(current)
      parts.unshift(segment)
      if (current.id !== '') break
      current = current.parentElement
    }
    return parts.join(' > ')
  }

  const items: Item[] = []
  const elements = document.querySelectorAll(
    '[data-slot="icon"], svg, img, input, button, a, select, textarea',
  )
  for (const element of Array.from(elements)) {
    if (
      element.tagName.toLowerCase() === 'svg' &&
      element.parentElement?.closest('[data-slot="icon"], svg')
    )
      continue
    if (!visible(element)) continue
    const box = boxOf(element.getBoundingClientRect())
    if (!onScreen(element, box)) continue
    const tag = element.tagName.toLowerCase()
    let kind: Kind
    if (element.getAttribute('data-slot') === 'icon' || tag === 'svg') kind = 'icon'
    else if (tag === 'img') kind = 'image'
    else kind = 'control'
    items.push({
      kind,
      selector: selectorOf(element),
      box,
      owner: element,
      textNode: null,
    })
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    if (!(node instanceof Text)) continue
    const content = node.textContent ?? ''
    if (content.trim() === '') continue
    const parent = node.parentElement
    if (
      parent === null ||
      parent.closest('script, style, noscript, svg') !== null ||
      !visible(parent)
    )
      continue
    const range = document.createRange()
    range.selectNodeContents(node)
    const label = content.trim().slice(0, 24).replace(/"/g, "'")
    for (const rect of Array.from(range.getClientRects())) {
      const box = boxOf(rect)
      if (!onScreen(parent, box)) continue
      items.push({
        kind: 'text',
        selector: `${selectorOf(parent)} ::text("${label}")`,
        box,
        owner: parent,
        textNode: node,
      })
    }
  }

  const contains = (outer: AlignBox, inner: AlignBox): boolean =>
    outer.left <= inner.left + 0.5 &&
    outer.top <= inner.top + 0.5 &&
    outer.right >= inner.right - 0.5 &&
    outer.bottom >= inner.bottom - 0.5

  const related = (first: Item, second: Item): boolean =>
    first.owner === second.owner ||
    first.owner.contains(second.owner) ||
    second.owner.contains(first.owner) ||
    contains(first.box, second.box) ||
    contains(second.box, first.box)

  const side = (item: Item): AlignSide => ({ selector: item.selector, box: item.box })

  const nearMiss = (
    first: Item,
    second: Item,
    check: 'row' | 'column',
    edges: Array<{ name: string; axis: 'x' | 'y'; read: (box: AlignBox) => number }>,
  ): void => {
    const deltas = edges.map((edge) => ({
      edge,
      delta: Math.abs(edge.read(first.box) - edge.read(second.box)),
    }))
    if (deltas.some((entry) => entry.delta <= limits.nearMin)) return
    const misses = deltas
      .filter((entry) => entry.delta <= limits.nearMax)
      .sort((left, right) => left.delta - right.delta)
    const best = misses[0]
    if (best === undefined) return
    const span = (box: AlignBox): [number, number] =>
      best.edge.axis === 'y' ? [box.left, box.right] : [box.top, box.bottom]
    const [firstFrom, firstTo] = span(first.box)
    const [secondFrom, secondTo] = span(second.box)
    const from = Math.min(firstFrom, secondFrom)
    const to = Math.max(firstTo, secondTo)
    findings.push({
      check,
      edge: best.edge.name,
      a: side(first),
      b: side(second),
      delta: round(best.delta),
      guides: [
        { axis: best.edge.axis, at: best.edge.read(first.box), from, to },
        { axis: best.edge.axis, at: best.edge.read(second.box), from, to },
      ],
    })
  }

  const rowEdges = [
    { name: 'top', axis: 'y' as const, read: (box: AlignBox) => box.top },
    { name: 'bottom', axis: 'y' as const, read: (box: AlignBox) => box.bottom },
    { name: 'centre-y', axis: 'y' as const, read: (box: AlignBox) => (box.top + box.bottom) / 2 },
  ]
  const columnEdges = [
    { name: 'left', axis: 'x' as const, read: (box: AlignBox) => box.left },
    { name: 'right', axis: 'x' as const, read: (box: AlignBox) => box.right },
    { name: 'centre-x', axis: 'x' as const, read: (box: AlignBox) => (box.left + box.right) / 2 },
  ]

  const overlapY = (first: AlignBox, second: AlignBox): number =>
    Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top)
  const overlapX = (first: AlignBox, second: AlignBox): number =>
    Math.min(first.right, second.right) - Math.max(first.left, second.left)

  for (let index = 0; index < items.length; index += 1) {
    const first = items[index]
    if (first === undefined) continue
    for (let other = index + 1; other < items.length; other += 1) {
      const second = items[other]
      if (second === undefined || related(first, second)) continue
      const sharedY = overlapY(first.box, second.box)
      const sharedX = overlapX(first.box, second.box)
      if (sharedY > 0 && first.owner.closest('kbd') === second.owner.closest('kbd')) {
        if (
          first.kind === 'text' &&
          second.kind === 'text' &&
          getComputedStyle(first.owner).fontSize !== getComputedStyle(second.owner).fontSize &&
          context !== null
        ) {
          const baseline = (item: Item): number => {
            const style = getComputedStyle(item.owner)
            context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
            const metrics = context.measureText('Hg')
            return (
              item.box.top +
              (item.box.bottom -
                item.box.top -
                metrics.fontBoundingBoxAscent -
                metrics.fontBoundingBoxDescent) /
                2 +
              metrics.fontBoundingBoxAscent
            )
          }
          const a = baseline(first)
          const b = baseline(second)
          const delta = Math.abs(a - b)
          if (delta > limits.nearMin && delta <= limits.nearMax)
            findings.push({
              check: 'row',
              edge: 'baseline',
              a: side(first),
              b: side(second),
              delta: round(delta),
              guides: [
                { axis: 'y', at: a, from: first.box.left, to: second.box.right },
                { axis: 'y', at: b, from: first.box.left, to: second.box.right },
              ],
            })
        } else nearMiss(first, second, 'row', rowEdges)
      } else if (sharedX > 0 && -sharedY <= limits.columnGap)
        nearMiss(first, second, 'column', columnEdges)
    }
  }

  const capCentreOf = (item: Item): number | null => {
    if (context === null) return null
    const style = getComputedStyle(item.owner)
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    const metrics = context.measureText('H')
    const ascent = metrics.fontBoundingBoxAscent
    const descent = metrics.fontBoundingBoxDescent
    const height = item.box.bottom - item.box.top
    const baseline = item.box.top + (height - (ascent + descent)) / 2 + ascent
    return baseline - metrics.actualBoundingBoxAscent / 2
  }

  const texts = items.filter((item) => item.kind === 'text')
  for (const icon of items.filter((item) => item.kind === 'icon')) {
    let nearest: Item | null = null
    let nearestGap = Number.POSITIVE_INFINITY
    for (const text of texts) {
      if (overlapY(icon.box, text.box) <= 0) continue
      const gap = Math.max(text.box.left - icon.box.right, icon.box.left - text.box.right)
      if (gap < 0 || gap > limits.iconTextGap || gap >= nearestGap) continue
      nearest = text
      nearestGap = gap
    }
    if (nearest === null) continue
    const capCentre = capCentreOf(nearest)
    if (capCentre === null) continue
    const iconCentre = (icon.box.top + icon.box.bottom) / 2
    const delta = Math.abs(iconCentre - capCentre)
    if (delta <= limits.iconTextMax) continue
    const from = Math.min(icon.box.left, nearest.box.left)
    const to = Math.max(icon.box.right, nearest.box.right)
    findings.push({
      check: 'icon-text',
      edge: 'cap-centre',
      a: side(icon),
      b: side(nearest),
      delta: round(delta),
      guides: [
        { axis: 'y', at: iconCentre, from, to },
        { axis: 'y', at: capCentre, from, to },
      ],
    })
  }

  const fractional = (value: number): boolean =>
    Math.abs(value * ratio - Math.round(value * ratio)) > 0.01
  for (const item of items) {
    if (item.kind === 'text') continue
    const offLeft = fractional(item.box.left)
    const offTop = fractional(item.box.top)
    if (!offLeft && !offTop) continue
    const delta = Math.max(
      Math.abs(item.box.left * ratio - Math.round(item.box.left * ratio)),
      Math.abs(item.box.top * ratio - Math.round(item.box.top * ratio)),
    )
    const guides: AlignGuide[] = []
    if (offLeft)
      guides.push({ axis: 'x', at: item.box.left, from: item.box.top, to: item.box.bottom })
    if (offTop)
      guides.push({ axis: 'y', at: item.box.top, from: item.box.left, to: item.box.right })
    findings.push({
      check: 'fractional',
      edge: [offLeft ? 'left' : '', offTop ? 'top' : ''].filter(Boolean).join(','),
      a: side(item),
      b: null,
      delta: round(delta),
      guides,
    })
  }

  const interactiveSelector =
    'button, a[href], input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="option"], [role="checkbox"], [role="radio"], [role="switch"]'
  const half = limits.hitTarget / 2
  const cell = limits.hitTarget / 11
  const offsets = Array.from({ length: 11 }, (_, index) => (index - 5) * cell)
  const squareGuides = (centreX: number, centreY: number): AlignGuide[] => [
    { axis: 'y', at: centreY - half, from: centreX - half, to: centreX + half },
    { axis: 'y', at: centreY + half, from: centreX - half, to: centreX + half },
    { axis: 'x', at: centreX - half, from: centreY - half, to: centreY + half },
    { axis: 'x', at: centreX + half, from: centreY - half, to: centreY + half },
  ]
  const extent = (hits: number[]): number => {
    const first = hits[0]
    const last = hits[hits.length - 1]
    return first === undefined || last === undefined ? 0 : round(last - first + cell)
  }
  const targets = Array.from(document.querySelectorAll(interactiveSelector)).filter(visible)
  for (const target of targets) {
    if (!visible(target)) continue
    const box = boxOf(target.getBoundingClientRect())
    if (!onScreen(target, box)) continue
    const clip = clipOf(target)
    const centreX = (box.left + box.right) / 2
    const centreY = (box.top + box.bottom) / 2
    if (
      box.left < clip.left ||
      box.top < clip.top ||
      box.right > clip.right ||
      box.bottom > clip.bottom
    )
      continue
    const owners: Element[] = [target]
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      for (const label of Array.from(target.labels ?? [])) owners.push(label)
    }
    const owns = (point: Element): boolean =>
      owners.some((owner) => owner === point || owner.contains(point))
    const rowHits: number[] = []
    const columnHits: number[] = []
    const thieves = new Set<Element>()
    const blockers = new Set<Element>()
    for (const offsetY of offsets) {
      for (const offsetX of offsets) {
        const point = document.elementFromPoint(centreX + offsetX, centreY + offsetY)
        if (point === null) continue
        if (owns(point)) {
          if (offsetY === 0) rowHits.push(offsetX)
          if (offsetX === 0) columnHits.push(offsetY)
          continue
        }
        const other = point.closest(interactiveSelector)
        if (other !== null && other !== target && !other.contains(target)) {
          thieves.add(other)
          continue
        }
        if (!point.contains(target) && !owners.some((owner) => point.contains(owner)))
          blockers.add(point)
      }
    }
    const hitWidth = extent(rowHits)
    const hitHeight = extent(columnHits)
    const targetSide: AlignSide = { selector: selectorOf(target), box }
    const style = getComputedStyle(target)
    for (const pseudo of ['::before', '::after']) {
      const expanded = getComputedStyle(target, pseudo)
      if (
        expanded.content === 'none' ||
        expanded.content === 'normal' ||
        expanded.pointerEvents === 'none' ||
        expanded.position !== 'absolute'
      )
        continue
      const left =
        box.left +
        (Number.parseFloat(style.borderLeftWidth) || 0) +
        Number.parseFloat(expanded.left)
      const top =
        box.top + (Number.parseFloat(style.borderTopWidth) || 0) + Number.parseFloat(expanded.top)
      const right = left + Number.parseFloat(expanded.width)
      const bottom = top + Number.parseFloat(expanded.height)
      if (![left, top, right, bottom].every(Number.isFinite)) continue
      for (const neighbour of targets) {
        if (neighbour === target || target.contains(neighbour) || neighbour.contains(target))
          continue
        const neighbourBox = boxOf(neighbour.getBoundingClientRect())
        const overlap = {
          left: Math.max(left, neighbourBox.left, clip.left),
          right: Math.min(right, neighbourBox.right, clip.right),
          top: Math.max(top, neighbourBox.top, clip.top),
          bottom: Math.min(bottom, neighbourBox.bottom, clip.bottom),
        }
        if (overlap.right <= overlap.left || overlap.bottom <= overlap.top) continue
        let intercepted = false
        for (const fraction of [0.25, 0.5, 0.75]) {
          const point = document.elementFromPoint(
            overlap.left + (overlap.right - overlap.left) * fraction,
            overlap.top + (overlap.bottom - overlap.top) * fraction,
          )
          if (point !== null && owns(point)) intercepted = true
        }
        if (!intercepted) continue
        findings.push({
          check: 'hit-target',
          edge: 'pseudo target overlaps neighbour visible box',
          a: targetSide,
          b: { selector: selectorOf(neighbour), box: neighbourBox },
          delta: round(Math.min(overlap.right - overlap.left, overlap.bottom - overlap.top)),
          guides: [
            {
              axis: 'y',
              at: (overlap.top + overlap.bottom) / 2,
              from: overlap.left,
              to: overlap.right,
            },
          ],
          measurements: {
            actual: round(Math.min(overlap.right - overlap.left, overlap.bottom - overlap.top)),
            expected: 0,
            values: [],
          },
        })
      }
    }
    if (hitWidth < limits.hitTarget || hitHeight < limits.hitTarget) {
      findings.push({
        check: 'hit-target',
        edge: `size ${hitWidth}x${hitHeight}`,
        a: targetSide,
        b: null,
        delta: round(limits.hitTarget - Math.min(hitWidth, hitHeight)),
        guides: squareGuides(centreX, centreY),
      })
    }
    for (const thief of thieves) {
      findings.push({
        check: 'hit-target',
        edge: 'overlap',
        a: targetSide,
        b: { selector: selectorOf(thief), box: boxOf(thief.getBoundingClientRect()) },
        delta: 0,
        guides: squareGuides(centreX, centreY),
      })
    }
    for (const blocker of blockers) {
      findings.push({
        check: 'hit-target',
        edge: 'blocked',
        a: targetSide,
        b: { selector: selectorOf(blocker), box: boxOf(blocker.getBoundingClientRect()) },
        delta: 0,
        guides: squareGuides(centreX, centreY),
      })
    }
  }

  return findings
}

export function drawGuides(findings: AlignFinding[]): void {
  for (const old of Array.from(document.querySelectorAll('[data-align-overlay]'))) old.remove()
  const layer = document.createElement('div')
  layer.setAttribute('data-align-overlay', '')
  layer.style.position = 'fixed'
  layer.style.inset = '0'
  layer.style.pointerEvents = 'none'
  layer.style.zIndex = '2147483647'
  for (const finding of findings) {
    for (const guide of finding.guides) {
      const line = document.createElement('div')
      line.style.position = 'absolute'
      line.style.background = 'rgb(255 0 0 / 0.85)'
      if (guide.axis === 'y') {
        line.style.left = `${guide.from}px`
        line.style.top = `${guide.at}px`
        line.style.width = `${Math.max(guide.to - guide.from, 1)}px`
        line.style.height = '1px'
      } else {
        line.style.left = `${guide.at}px`
        line.style.top = `${guide.from}px`
        line.style.width = '1px'
        line.style.height = `${Math.max(guide.to - guide.from, 1)}px`
      }
      layer.append(line)
    }
  }
  document.body.append(layer)
}
