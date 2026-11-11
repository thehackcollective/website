import type { ScoredFinding, ViewerPage } from './align-capture'
import { createPlayback, type PlaybackRound } from './align-playback'
import type { RoundDiff } from './align-round'

const report: {
  pages: ViewerPage[]
  previous: ViewerPage[]
  round: number | null
  timeline: Array<{ number: number; href: string }>
  diff: RoundDiff
  playbackRounds: PlaybackRound[]
} = JSON.parse(document.querySelector('#report')?.textContent ?? '{}')
const pages = report.pages
const checks = ['row', 'column', 'icon-text', 'fractional', 'hit-target', 'spacing', 'rhythm']
const enabled = new Set(checks)
const params = new URL(location.href).searchParams
const exporting = params.has('export')
let pageIndex = Number(params.get('page') ?? 0)
let step = 0
let selected: ScoredFinding | undefined
let skeleton = true
let overlay = true
let showComponents = false
let showNoise = false
let compare = false
if (exporting) {
  document.body.classList.add('export')
  enabled.clear()
  enabled.add('rhythm')
}
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, parent: Element, text = '') => {
  const node = document.createElement(tag)
  node.textContent = text
  parent.append(node)
  return node
}
const header = el('header', document.body)
el('strong', header, 'Alignment reel')
const timeline = el('div', header)
timeline.className = 'timeline'
for (const round of report.timeline) {
  const link = el('a', timeline, `round ${String(round.number).padStart(2, '0')}`)
  link.href = round.href
  if (round.number === report.round) link.setAttribute('aria-current', 'page')
}
const all = pages.flatMap((page) => page.findings)
const real = all.filter((finding) => finding.noiseScore < 0.5).length
el('span', header, `${real} likely real · ${all.length - real} noise`)
const control = (text: string, action: () => void) => {
  const button = el('button', header, text)
  button.onclick = action
  return button
}
const fromRound = el('select', header)
fromRound.setAttribute('aria-label', 'Playback from round')
const toRound = el('select', header)
toRound.setAttribute('aria-label', 'Playback to round')
for (const round of report.playbackRounds) {
  for (const select of [fromRound, toRound]) {
    const option = el('option', select, `Round ${round.number}`)
    option.value = String(round.number)
  }
}
toRound.value = String(report.playbackRounds.at(-1)?.number ?? '')
const playbackRegion = el('select', header)
playbackRegion.setAttribute('aria-label', 'Playback region')
for (const region of ['sidebar-card', 'sidebar', 'main', 'full']) {
  const option = el('option', playbackRegion, region)
  option.value = region
}
let playbackToken = 0
const playButton = control('Play · P', () => {
  void play()
})
const componentLegend = el('div', header)
componentLegend.className = 'component-legend'
for (const [label, color] of [
  ['Component', '#64748b'],
  ['Clickable-bound', '#4f46e5'],
  ['Clickable-gap', '#f59e0b'],
] as const) {
  const item = el('span', componentLegend)
  const swatch = el('i', item)
  swatch.style.backgroundColor = color
  el('span', item, label)
}
async function play() {
  if (playButton.textContent === 'Stop · P') {
    playbackToken += 1
    playButton.textContent = 'Play · P'
    render()
    return
  }
  const token = ++playbackToken
  const findPage = (number: string) =>
    report.playbackRounds
      .find((round) => String(round.number) === number)
      ?.pages.find((page) => page.path === current()?.path && page.width === current()?.width)
  const before = findPage(fromRound.value)
  const after = findPage(toRound.value)
  if (!before || !after || Number(fromRound.value) >= Number(toRound.value)) {
    detail.textContent = 'Choose an earlier and a later round with matching captures.'
    return
  }
  playButton.textContent = 'Stop · P'
  stage.replaceChildren()
  const film = el('canvas', stage)
  try {
    const player = await createPlayback(film, before, after, playbackRegion.value)
    if (token !== playbackToken) return
    const scale = Math.min(
      1,
      (canvas.clientWidth - 48) / film.width,
      (canvas.clientHeight - 48) / film.height,
    )
    film.style.width = `${film.width * scale}px`
    film.style.height = `${film.height * scale}px`
    stage.style.width = film.style.width
    stage.style.height = film.style.height
    canvas.scrollTo(0, 0)
    const start = performance.now()
    const tick = (now: number) => {
      if (token !== playbackToken) return
      const elapsed = (now - start) / 1000
      player.render(elapsed)
      if (elapsed < player.duration) requestAnimationFrame(tick)
      else playButton.textContent = 'Play · P'
    }
    requestAnimationFrame(tick)
  } catch (error) {
    if (token === playbackToken) {
      playButton.textContent = 'Play · P'
      detail.textContent = `Playback failed: ${String(error)}`
    }
  }
}
const mode = control('Clean · S', () => {
  skeleton = !skeleton
  render()
})
const overlayButton = control('Overlay on', () => {
  overlay = !overlay
  render()
})
const componentsButton = control('Components off', () => {
  showComponents = !showComponents
  componentsButton.textContent = `Components ${showComponents ? 'on' : 'off'}`
  componentsButton.setAttribute('aria-pressed', String(showComponents))
  render()
})
const noise = control('Show noise', () => {
  showNoise = !showNoise
  selected = undefined
  render()
})
control('Fit', () => {
  selected = undefined
  render()
})
const layout = el('div', document.body)
const compareButton = control('Compare: current', () => {
  compare = !compare
  render()
})
compareButton.disabled = report.previous.length === 0
layout.className = 'layout'
const nav = el('nav', layout)
nav.setAttribute('aria-label', 'Pages and steps')
const center = el('main', layout)
const filters = el('div', center)
filters.className = 'filters'
const canvas = el('div', center)
canvas.className = 'canvas'
const stage = el('div', canvas)
stage.className = 'stage'
const aside = el('aside', layout)
const title = el('div', aside)
title.className = 'section-title'
const detail = el('div', aside)
detail.className = 'detail'
const list = el('div', aside)
list.className = 'findings'
const current = () => pages[pageIndex]
const exportRegion = () => {
  const shot = current()?.screenshots.find((item) => item.step === step)
  if (!exporting || shot?.regions === undefined) return null
  return params.get('region') === 'sidebar' ? shot.regions.sidebar : shot.regions.main
}
const fixed = () =>
  report.diff.fixed
    .filter(
      (entry) =>
        entry.path === current()?.path &&
        entry.width === current()?.width &&
        entry.finding.step === step,
    )
    .map((entry) => entry.finding)
const fixedIds = new Set(report.diff.fixed.map((entry) => entry.finding.id))
const newIds = new Set(report.diff.new.map((entry) => entry.finding.id))
const visible = () =>
  [...(current()?.findings ?? []), ...fixed()]
    .filter(
      (finding) =>
        finding.step === step &&
        enabled.has(finding.check) &&
        (showNoise || finding.noiseScore < 0.5),
    )
    .sort((a, b) => a.noiseScore - b.noiseScore || b.delta - a.delta)
const svgNode = (tag: string, attrs: Record<string, string | number>, text = '') => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value))
  node.textContent = text
  return node
}
function choose(finding: ScoredFinding) {
  selected = finding
  render()
}
function render() {
  playbackToken += 1
  playButton.textContent = 'Play · P'
  compareButton.textContent = compare ? 'Compare: previous' : 'Compare: current'
  compareButton.setAttribute('aria-pressed', String(compare))
  nav.replaceChildren()
  pages.forEach((page, index) => {
    el('div', nav, `${page.path} / ${page.width}`).className = 'page-title'
    for (const shot of page.screenshots) {
      const button = el('button', nav, `Step ${shot.step + 1} · y ${shot.scrollY}`)
      button.className = index === pageIndex && step === shot.step ? 'active' : ''
      button.onclick = () => {
        pageIndex = index
        step = shot.step
        selected = undefined
        render()
      }
    }
  })
  mode.textContent = skeleton ? 'Skeleton · S' : 'Clean · S'
  mode.setAttribute('aria-pressed', String(skeleton))
  overlayButton.textContent = overlay ? 'Overlay on' : 'Overlay off'
  overlayButton.setAttribute('aria-pressed', String(overlay))
  noise.textContent = showNoise ? 'Hide noise' : 'Show noise'
  noise.setAttribute('aria-pressed', String(showNoise))
  filters.replaceChildren()
  for (const check of checks) {
    const count =
      current()?.findings.filter(
        (finding) =>
          finding.step === step &&
          finding.check === check &&
          (showNoise || finding.noiseScore < 0.5),
      ).length ?? 0
    const label = el('label', filters)
    const input = el('input', label)
    input.type = 'checkbox'
    input.checked = enabled.has(check)
    input.onchange = () => {
      if (input.checked) enabled.add(check)
      else enabled.delete(check)
      selected = undefined
      render()
    }
    el('span', label, `${check} ${count}`)
  }
  const findings = visible()
  title.textContent = `Findings · ${findings.length}   /   J ↓ K ↑`
  detail.replaceChildren()
  if (selected) {
    let status = 'Open'
    if (fixedIds.has(selected.id)) status = '✓ Fixed'
    else if (newIds.has(selected.id)) status = 'New'
    el('strong', detail, `${status} · Δ${selected.delta}px ${selected.edge}`)
    const change = report.diff.stillOpen.find((entry) => entry.id === selected?.id)
    if (change) el('span', detail, `${change.oldDelta}px → ${change.newDelta}px`)
    if (selected.rhythm)
      el(
        'span',
        detail,
        `Mode ${selected.measurements?.expected}px · on token scale: ${selected.rhythm.onTokenScale}`,
      )
    el('code', detail, `A ${selected.a.selector}`)
    el('code', detail, selected.b ? `B ${selected.b.selector}` : 'B —')
    el('span', detail, `${selected.noiseReason} · noise ${Math.round(selected.noiseScore * 100)}%`)
  }
  list.replaceChildren()
  if (findings.length === 0) el('p', list, 'No findings in this filter.')
  findings.forEach((finding, index) => {
    const button = el('button', list)
    button.className = finding === selected ? 'finding active' : 'finding'
    el(
      'strong',
      button,
      `${fixedIds.has(finding.id) ? '✓' : String(index + 1).padStart(2, '0')}  ${finding.check} · Δ${finding.delta}px`,
    )
    el('span', button, finding.edge)
    el('code', button, finding.a.selector)
    button.onclick = () => choose(finding)
  })
  stage.replaceChildren()
  const shot = current()?.screenshots.find((item) => item.step === step)
  if (!shot) {
    el('p', stage, 'No captures.')
    return
  }
  const { width, height } = shot.viewport
  let zoom = 1
  if (selected) zoom = 2
  else if (!exporting) zoom = Math.min(1, (canvas.clientWidth - 64) / width)
  stage.style.width = `${width * zoom + 24}px`
  stage.style.height = `${height * zoom + 24}px`
  const image = el('img', stage)
  image.alt = `${current()?.path} ${skeleton ? 'skeleton' : 'clean'} step ${step + 1}`
  const previousShot = report.previous
    .find((page) => page.path === current()?.path && page.width === current()?.width)
    ?.screenshots.find((item) => item.step === step)
  image.className = skeleton ? 'skeleton' : ''
  if (compare && previousShot) image.src = skeleton ? previousShot.skeleton : previousShot.clean
  else if (skeleton) image.src = shot.skeleton
  else image.src = shot.clean
  image.style.width = `${width * zoom}px`
  image.style.height = `${height * zoom}px`
  const svg = svgNode('svg', { width: width * zoom + 24, height: height * zoom + 24 })
  stage.append(svg)
  const ruler = svgNode('g', { fill: '#73777d', 'font-size': 9, 'font-family': 'system-ui' })
  svg.append(ruler)
  for (let x = 0; x < width; x += 100) {
    ruler.append(
      svgNode('text', { x: 24 + x * zoom, y: 10 }, String(x)),
      svgNode('line', { x1: 24 + x * zoom, x2: 24 + x * zoom, y1: 14, y2: 23, stroke: '#aeb2b8' }),
    )
  }
  for (let y = 0; y < height; y += 100) {
    ruler.append(
      svgNode('text', { x: 1, y: 33 + y * zoom }, String(y)),
      svgNode('line', { x1: 16, x2: 23, y1: 24 + y * zoom, y2: 24 + y * zoom, stroke: '#aeb2b8' }),
    )
  }
  const region = exportRegion()
  const inRegion = (finding: ScoredFinding) => {
    if (region === null || region === undefined) return true
    const centerX = (finding.a.box.left + finding.a.box.right) / 2
    const centerY = (finding.a.box.top + finding.a.box.bottom) / 2
    return (
      centerX >= region.left &&
      centerX <= region.right &&
      centerY >= region.top &&
      centerY <= region.bottom
    )
  }
  const inBox = (box: { left: number; right: number; top: number; bottom: number }) => {
    if (region === null || region === undefined) return true
    const centerX = (box.left + box.right) / 2
    const centerY = (box.top + box.bottom) / 2
    return (
      centerX >= region.left &&
      centerX <= region.right &&
      centerY >= region.top &&
      centerY <= region.bottom
    )
  }
  const painted = (selected ? [selected] : findings).filter(
    (finding) => finding.check !== 'rhythm' && inRegion(finding),
  )
  if (enabled.has('rhythm'))
    painted.push(
      ...(current()?.rhythm ?? []).filter((finding) => finding.step === step && inRegion(finding)),
    )
  const outlined = new Set<string>()
  const dimensions = new Set<string>()
  if (overlay) {
    const components = svgNode('g', {
      transform: `translate(24 24) scale(${zoom})`,
      'data-components': 'true',
    })
    for (const component of showComponents ? (shot.components ?? []) : []) {
      if (!inBox(component.box)) continue
      let color = '#f59e0b'
      if (component.kind === 'component') color = '#64748b'
      else if (component.kind === 'clickable-bound') color = '#4f46e5'
      const rectangle = svgNode('rect', {
        x: component.box.left,
        y: component.box.top,
        width: component.box.right - component.box.left,
        height: component.box.bottom - component.box.top,
        fill: 'none',
        stroke: color,
        'stroke-opacity': '.55',
        'stroke-width': 1 / zoom,
      })
      if (component.kind === 'clickable-gap') rectangle.setAttribute('stroke-dasharray', '4 3')
      components.append(rectangle)
    }
    svg.append(components)
    for (const finding of painted.toSorted((a, b) => b.delta - a.delta)) {
      if (finding.rhythm) {
        const key = JSON.stringify([
          finding.a.selector,
          finding.guides,
          finding.measurements?.actual,
        ])
        if (dimensions.has(key)) continue
        dimensions.add(key)
      }
      let color = fixedIds.has(finding.id) ? '#1a8cff' : '#f24822'
      if (finding.check === 'rhythm') color = finding.delta === 0 ? '#1a8cff' : '#f24822'
      const group = svgNode('g', {
        transform: `translate(24 24) scale(${zoom})`,
        'data-finding': finding.check,
      })
      svg.append(group)
      for (const side of [finding.a, finding.b])
        if (side && !outlined.has(side.selector)) {
          outlined.add(side.selector)
          const box = side.box
          group.append(
            svgNode('rect', {
              x: box.left,
              y: box.top,
              width: box.right - box.left,
              height: box.bottom - box.top,
              fill: 'none',
              stroke: '#1a8cff',
              'stroke-opacity': 0.25,
              'stroke-width': 1 / zoom,
            }),
          )
        }
      for (const guide of finding.guides)
        group.append(
          svgNode('line', {
            x1: guide.axis === 'x' ? guide.at : guide.from,
            x2: guide.axis === 'x' ? guide.at : guide.to,
            y1: guide.axis === 'y' ? guide.at : guide.from,
            y2: guide.axis === 'y' ? guide.at : guide.to,
            stroke: '#1a8cff',
            'stroke-opacity': 0.4,
            'stroke-width': 1 / zoom,
          }),
        )
      const guide = finding.guides[0]
      if (guide) {
        const value = finding.measurements?.actual ?? finding.delta
        const dpr = finding.dpr || 1
        const label = String(Number((Math.round(value * dpr) / dpr).toFixed(1)))
        if (finding.rhythm) {
          for (const edge of [guide.from, guide.to])
            group.append(
              svgNode('line', {
                x1: guide.axis === 'y' ? edge : finding.a.box.left,
                x2: guide.axis === 'y' ? edge : finding.a.box.right,
                y1: guide.axis === 'y' ? finding.a.box.top : edge,
                y2: guide.axis === 'y' ? finding.a.box.bottom : edge,
                stroke: '#1a8cff',
                'stroke-opacity': 0.4,
                'stroke-width': 1 / zoom,
              }),
            )
        }
        const badgeWidth = Math.max(16, label.length * 5.5 + 8)
        let anchor = guide.axis === 'x' ? guide.at : (guide.from + guide.to) / 2
        if (finding.rhythm?.column.endsWith('left-inset')) anchor = finding.a.box.left + 8
        else if (finding.rhythm?.column.endsWith('right-inset')) anchor = finding.a.box.right - 12
        const x = Math.max(2, Math.min(width - badgeWidth / zoom, anchor - badgeWidth / (2 * zoom)))
        const y = Math.max(
          8 / zoom,
          Math.min(height - 8 / zoom, guide.axis === 'y' ? guide.at : (guide.from + guide.to) / 2),
        )
        const badge = svgNode('g', { transform: `translate(${x} ${y}) scale(${1 / zoom})` })
        badge.append(
          svgNode('rect', {
            x: 0,
            y: -8,
            width: badgeWidth,
            height: 16,
            rx: 8,
            fill: color,
          }),
          svgNode(
            'text',
            {
              x: badgeWidth / 2,
              y: 3.5,
              fill: 'white',
              'font-family': 'system-ui',
              'font-size': 10,
              'font-weight': 700,
              'text-anchor': 'middle',
            },
            label,
          ),
        )
        group.append(badge)
      }
    }
  }
  if (selected) {
    const box = selected.a.box
    canvas.scrollTo({
      left: ((box.left + box.right) / 2) * zoom + 24 - canvas.clientWidth / 2,
      top: ((box.top + box.bottom) / 2) * zoom + 24 - canvas.clientHeight / 2,
    })
  } else canvas.scrollTo(0, 0)
}
document.addEventListener('keydown', (event) => {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  )
    return
  if (event.key === 'p') {
    event.preventDefault()
    void play()
    return
  }
  if (event.key === 's') {
    skeleton = !skeleton
    render()
  }
  if (event.key === 'j' || event.key === 'k') {
    event.preventDefault()
    const findings = visible()
    const index = selected ? findings.indexOf(selected) : -1
    const next =
      findings[(index + (event.key === 'j' ? 1 : -1) + findings.length) % findings.length]
    if (next) choose(next)
  }
})
render()
