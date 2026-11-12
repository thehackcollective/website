import type { AlignComponent, ScoredFinding } from './align-capture'
import type { AlignBox } from './align-page'

export interface ComparePage {
  path: string
  width: number
  height: number
  before: string
  after: string
  sidebar: AlignBox | null
  oldMarks: ScoredFinding[]
  newMarks: ScoredFinding[]
  fixed: ScoredFinding[]
  beforeComponents: AlignComponent[]
  afterComponents: AlignComponent[]
}

const data: ComparePage[] = JSON.parse(document.querySelector('#compare-data')?.textContent ?? '[]')
const root = document.querySelector('#pages')
const svgNode = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string>,
) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value)
  return node
}
const image = async (src: string) => {
  const img = new Image()
  img.src = src
  await img.decode()
  return img
}
function changedCrop(
  before: Uint8ClampedArray,
  after: Uint8ClampedArray,
  width: number,
  region: AlignBox,
): AlignBox | null {
  let left = region.right
  let right = region.left
  let top = region.bottom
  let bottom = region.top
  for (let y = Math.ceil(region.top); y < region.bottom; y += 2)
    for (let x = Math.ceil(region.left); x < region.right; x += 2) {
      const index = (y * width + x) * 4
      const distance =
        Math.abs((before[index] ?? 0) - (after[index] ?? 0)) +
        Math.abs((before[index + 1] ?? 0) - (after[index + 1] ?? 0)) +
        Math.abs((before[index + 2] ?? 0) - (after[index + 2] ?? 0))
      if (distance < 90) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  if (right < left) return null
  return {
    left: Math.max(region.left, left - 16),
    right: Math.min(region.right, right + 18),
    top: Math.max(region.top, top - 16),
    bottom: Math.min(region.bottom, bottom + 18),
  }
}
function addSide(parent: HTMLElement, page: ComparePage, crop: AlignBox, after: boolean) {
  const figure = document.createElement('figure')
  parent.append(figure)
  const caption = document.createElement('figcaption')
  caption.append(after ? 'After' : 'Before')
  figure.append(caption)
  const toggle = document.createElement('button')
  toggle.textContent = 'Badges: off'
  toggle.setAttribute('aria-pressed', 'false')
  toggle.setAttribute('aria-label', `${after ? 'After' : 'Before'} badges for ${page.path}`)
  caption.append(toggle)
  const componentsToggle = document.createElement('button')
  componentsToggle.textContent = 'Components: off'
  componentsToggle.setAttribute('aria-pressed', 'false')
  componentsToggle.setAttribute(
    'aria-label',
    `${after ? 'After' : 'Before'} components for ${page.path}`,
  )
  caption.append(componentsToggle)
  const svg = svgNode('svg', {
    viewBox: `${crop.left} ${crop.top} ${crop.right - crop.left} ${crop.bottom - crop.top}`,
    role: 'img',
    'aria-label': `${page.path} ${after ? 'after' : 'before'} clean crop`,
  })
  svg.append(
    svgNode('image', {
      href: after ? page.after : page.before,
      width: String(page.width),
      height: String(page.height),
    }),
  )
  figure.append(svg)
  const overlay = svgNode('g', {})
  overlay.style.display = 'none'
  svg.append(overlay)
  const componentLayer = svgNode('g', { 'data-components': 'true' })
  componentLayer.style.display = 'none'
  svg.append(componentLayer)
  const components = after ? page.afterComponents : page.beforeComponents
  for (const component of components) {
    if (
      component.box.left >= crop.right ||
      component.box.right <= crop.left ||
      component.box.top >= crop.bottom ||
      component.box.bottom <= crop.top
    )
      continue
    let color = '#f59e0b'
    if (component.kind === 'component') color = '#64748b'
    else if (component.kind === 'clickable-bound') color = '#4f46e5'
    const rectangle = svgNode('rect', {
      x: String(component.box.left),
      y: String(component.box.top),
      width: String(component.box.right - component.box.left),
      height: String(component.box.bottom - component.box.top),
      fill: 'none',
      stroke: color,
      'stroke-opacity': '.55',
      'stroke-width': '1',
    })
    if (component.kind === 'clickable-gap') rectangle.setAttribute('stroke-dasharray', '4 3')
    componentLayer.append(rectangle)
  }
  const marks = new Map((after ? page.newMarks : page.oldMarks).map((mark) => [mark.id, mark]))
  const resolved = new Set<string>()
  const targets = new Map(components.map((component) => [component.identity, component]))
  if (after)
    for (const fixed of page.fixed)
      if (!marks.has(fixed.id)) {
        const target = targets.get(fixed.identity.a)
        if (target === undefined) continue
        resolved.add(fixed.id)
        marks.set(fixed.id, {
          ...fixed,
          a: { ...fixed.a, box: target.box },
          guides: [],
          delta: 0,
        })
      }
  for (const mark of marks.values()) {
    const box = mark.a.box
    if (
      box.left >= crop.right ||
      box.right <= crop.left ||
      box.top >= crop.bottom ||
      box.bottom <= crop.top
    )
      continue
    const isHitTarget = mark.check === 'hit-target'
    const isResolved = resolved.has(mark.id)
    const failing = isHitTarget ? !isResolved : mark.delta > 0
    if (isHitTarget || isResolved)
      overlay.append(
        svgNode('rect', {
          x: String(box.left),
          y: String(box.top),
          width: String(box.right - box.left),
          height: String(box.bottom - box.top),
          fill: 'none',
          stroke: '#1a8cff',
          'stroke-opacity': '.4',
          'stroke-width': '1',
          'data-target': mark.identity.a,
        }),
      )
    for (const guide of isHitTarget || isResolved ? [] : mark.guides)
      overlay.append(
        svgNode('line', {
          x1: String(guide.axis === 'x' ? guide.at : guide.from),
          x2: String(guide.axis === 'x' ? guide.at : guide.to),
          y1: String(guide.axis === 'y' ? guide.at : guide.from),
          y2: String(guide.axis === 'y' ? guide.at : guide.to),
          stroke: '#1a8cff',
          'stroke-opacity': '.4',
          'stroke-width': '1',
        }),
      )
    const guide = mark.guides[0]
    if (!guide && !isHitTarget && !isResolved) continue
    let x = (box.left + box.right) / 2
    let y = box.top + 8
    if (guide && !isHitTarget && !isResolved) {
      x = guide.axis === 'x' ? guide.at : (guide.from + guide.to) / 2
      y = guide.axis === 'y' ? guide.at : (guide.from + guide.to) / 2
    }
    const size = mark.edge.match(/^size ([\d.]+)x([\d.]+)$/)
    let value = String(Number((mark.measurements?.actual ?? mark.delta).toFixed(1)))
    if (isResolved) value = 'fixed'
    else if (size) value = `${size[1]}×${size[2]}`
    else if (isHitTarget) value = mark.edge === 'blocked' ? 'blocked' : 'overlap'
    const w = Math.max(20, value.length * 7 + 10)
    x = Math.max(crop.left + w / 2, Math.min(crop.right - w / 2, x))
    y = Math.max(crop.top + 8, Math.min(crop.bottom - 8, y))
    overlay.append(
      svgNode('rect', {
        x: String(x - w / 2),
        y: String(y - 8),
        width: String(w),
        height: '16',
        rx: '8',
        fill: failing ? '#f24822' : '#1a8cff',
      }),
    )
    const text = svgNode('text', {
      x: String(x),
      y: String(y + 4),
      fill: 'white',
      'font-family': 'system-ui',
      'font-weight': '700',
      'font-size': '11',
      'text-anchor': 'middle',
    })
    text.textContent = value
    overlay.append(text)
  }
  toggle.onclick = () => {
    const shown = toggle.getAttribute('aria-pressed') !== 'true'
    toggle.setAttribute('aria-pressed', String(shown))
    toggle.textContent = `Badges: ${shown ? 'on' : 'off'}`
    overlay.style.display = shown ? '' : 'none'
  }
  componentsToggle.onclick = () => {
    const shown = componentsToggle.getAttribute('aria-pressed') !== 'true'
    componentsToggle.setAttribute('aria-pressed', String(shown))
    componentsToggle.textContent = `Components: ${shown ? 'on' : 'off'}`
    componentLayer.style.display = shown ? '' : 'none'
  }
}
async function render() {
  if (!root) return
  root.replaceChildren()
  for (const page of data) {
    const [before, after] = await Promise.all([image(page.before), image(page.after)])
    const canvas = document.createElement('canvas')
    canvas.width = page.width
    canvas.height = page.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('The compare view needs a canvas context.')
    ctx.drawImage(before, 0, 0, page.width, page.height)
    const oldPixels = ctx.getImageData(0, 0, page.width, page.height).data
    ctx.drawImage(after, 0, 0, page.width, page.height)
    const newPixels = ctx.getImageData(0, 0, page.width, page.height).data
    const full = { left: 0, top: 0, right: page.width, bottom: page.height }
    const regions = page.sidebar ? [page.sidebar, { ...full, left: page.sidebar.right }] : [full]
    const crops = regions.flatMap((region) => {
      if (new URL(location.href).searchParams.has('full')) return []
      let crop = changedCrop(oldPixels, newPixels, page.width, region)
      for (const mark of page.fixed) {
        const box = mark.a.box
        if (
          box.right <= region.left ||
          box.left >= region.right ||
          box.bottom <= region.top ||
          box.top >= region.bottom
        )
          continue
        const bounds = {
          left: Math.max(region.left, box.left - 16),
          right: Math.min(region.right, box.right + 16),
          top: Math.max(region.top, box.top - 16),
          bottom: Math.min(region.bottom, box.bottom + 16),
        }
        crop = crop
          ? {
              left: Math.min(crop.left, bounds.left),
              right: Math.max(crop.right, bounds.right),
              top: Math.min(crop.top, bounds.top),
              bottom: Math.max(crop.bottom, bounds.bottom),
            }
          : bounds
      }
      return crop ? [crop] : []
    })
    const section = document.createElement('section')
    const title = document.createElement('h2')
    title.textContent = `${page.path} · ${page.width}px`
    section.append(title)
    root.append(section)
    if (!crops.length) {
      crops.push(full)
      const status = document.createElement('p')
      status.textContent = 'No visible change in this capture.'
      section.append(status)
    }
    for (const crop of crops) {
      const pair = document.createElement('div')
      pair.className = 'pair'
      pair.style.maxWidth = `${(crop.right - crop.left) * 2 + 16}px`
      section.append(pair)
      addSide(pair, page, crop, false)
      addSide(pair, page, crop, true)
    }
  }
}
void render().catch((error: unknown) => {
  if (root) {
    root.className = 'error'
    root.textContent = `Could not render the comparison: ${String(error)}`
  }
})
