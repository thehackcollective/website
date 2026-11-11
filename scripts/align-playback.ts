import type { ScoredFinding, ViewerPage } from './align-capture'
import type { AlignBox } from './align-page'

export interface PlaybackRound {
  startingHead?: string | undefined
  number: number
  pages: ViewerPage[]
}

export interface PlaybackCategory {
  name: string
  pairs: Array<{ before: ScoredFinding; after: ScoredFinding }>
}

const allMarks = (page: ViewerPage) =>
  [...(page.rhythm ?? []), ...page.findings].filter((mark) => mark.step === 0)
const measuredValue = (mark: ScoredFinding) => mark.measurements?.actual ?? mark.delta

export function playbackCategories(before: ViewerPage, after: ViewerPage): PlaybackCategory[] {
  const oldMarks = allMarks(before)
  const newMarks = allMarks(after)
  const oldById = new Map(oldMarks.map((mark) => [mark.id, mark]))
  const newById = new Map(newMarks.map((mark) => [mark.id, mark]))
  const oldByEdge = new Map(oldMarks.map((mark) => [`${mark.identity.a}:${mark.edge}`, mark]))
  const groups = new Map<string, PlaybackCategory>()
  const seen = new Set<string>()
  const add = (name: string, old: ScoredFinding, next: ScoredFinding) => {
    const key = `${name}:${next.identity.a}:${next.identity.b}`
    if (seen.has(key)) return
    seen.add(key)
    const group = groups.get(name) ?? { name, pairs: [] }
    group.pairs.push({ before: old, after: next })
    groups.set(name, group)
  }
  for (const next of newMarks.filter((mark) => mark.rhythm)) {
    let old = oldById.get(next.id)
    if (!old && next.edge.startsWith('shared-') && next.identity.a.includes('aside')) {
      const edge = next.edge === 'shared-left-edge' ? 'left-inset' : 'right-inset'
      const local = oldByEdge.get(`${next.identity.a}:${edge}`)
      const guide = local?.guides[0]
      const target = next.guides[0]
      if (
        local &&
        guide &&
        target &&
        local.measurements &&
        (edge === 'left-inset' || target.from <= local.a.box.right)
      ) {
        const from = edge === 'left-inset' ? target.from : guide.from
        const to = edge === 'left-inset' ? guide.to : target.to
        old = {
          ...local,
          guides: [{ ...guide, from, to }],
          measurements: { ...local.measurements, actual: to - from },
        }
      }
    }
    if (old && measuredValue(old) !== measuredValue(next) && next.delta === 0)
      add(
        next.edge.startsWith('shared-')
          ? `shared-edge · ${next.edge.slice(7, -5)}`
          : `rhythm · ${next.edge}`,
        old,
        next,
      )
  }
  for (const old of before.findings.filter(
    (mark) => mark.step === 0 && mark.noiseScore < 0.5 && mark.check !== 'rhythm',
  )) {
    const next = newById.get(old.id)
    if (next) continue
    const fixed = next ?? {
      ...old,
      delta: 0,
      measurements: {
        actual: old.measurements?.expected ?? 0,
        expected: old.measurements?.expected ?? 0,
        values: [],
      },
    }
    let name = old.check.toString()
    const size = old.edge.match(/^size ([\d.]+)x([\d.]+)$/)
    if (old.check === 'hit-target' && size) {
      const actual = Math.min(Number(size[1]), Number(size[2]))
      const expected = actual + old.delta
      add(
        `${name} · size`,
        { ...old, measurements: { actual, expected, values: [] } },
        { ...fixed, measurements: { actual: expected, expected, values: [] } },
      )
    } else {
      name += ` · ${old.edge}`
      add(name, old, fixed)
    }
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function playbackCrops(page: ViewerPage, region: string): AlignBox[] {
  const shot = page.screenshots[0]
  if (!shot) return []
  const full = { left: 0, top: 0, right: shot.viewport.width, bottom: shot.viewport.height }
  if (region === 'main') return [shot.regions?.main ?? full]
  if (region === 'sidebar') return [shot.regions?.sidebar ?? full]
  if (region === 'sidebar-card') {
    const card = page.rhythm?.find((mark) => mark.step === 0 && mark.edge === 'media-left-inset')
    const parent = page.rhythm?.find(
      (mark) => mark.step === 0 && mark.edge === 'left-inset' && !mark.identity.a.includes('aside'),
    )
    const box = parent?.a.box ?? card?.a.box
    if (box)
      return [
        shot.regions?.sidebar ?? full,
        {
          left: Math.max(0, box.left - 16),
          top: Math.max(0, box.top - 16),
          right: Math.min(full.right, box.right + 16),
          bottom: Math.min(full.bottom, box.bottom + 16),
        },
      ]
  }
  return [full]
}

export async function createPlayback(
  canvas: HTMLCanvasElement,
  before: ViewerPage,
  after: ViewerPage,
  region: string,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Playback needs a canvas context.')
  const crops = playbackCrops(before, region)
  const inCrop = (mark: ScoredFinding) =>
    crops.some((crop) => {
      const box = mark.a.box
      return (
        (box.left + box.right) / 2 >= crop.left &&
        (box.left + box.right) / 2 <= crop.right &&
        (box.top + box.bottom) / 2 >= crop.top &&
        (box.top + box.bottom) / 2 <= crop.bottom
      )
    })
  const categories = playbackCategories(before, after)
    .map((category) => ({
      ...category,
      pairs: category.pairs.filter((pair) => inCrop(pair.before) || inCrop(pair.after)),
    }))
    .filter((category) => category.pairs.length > 0)
  canvas.width = Math.ceil(crops.reduce((sum, box) => sum + box.right - box.left, 0) / 2) * 2
  canvas.height = Math.ceil(Math.max(1, ...crops.map((box) => box.bottom - box.top)) / 2) * 2 + 48
  const sources = [
    before.screenshots[0]?.skeleton,
    after.screenshots[0]?.skeleton,
    after.screenshots[0]?.clean,
  ]
  const images = await Promise.all(
    sources.map(async (url) => {
      if (!url) throw new Error('Playback needs matching captures.')
      const img = new Image()
      img.src = url
      await img.decode()
      return img
    }),
  )
  const duration = categories.length * 2.6 + 1.6
  const render = (time: number) => {
    const category = categories[Math.floor(time / 2.6)]
    const progress = Math.min(1, Math.max(0, ((time % 2.6) - 1) / 0.6))
    ctx.fillStyle = '#f2f2f2'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#252525'
    ctx.font = '600 14px system-ui'
    const title = category ? `${category.name} · ${category.pairs.length} fixes` : 'Clean · after'
    ctx.fillStyle = '#e2e2e2'
    ctx.beginPath()
    ctx.roundRect(8, 8, Math.min(canvas.width - 16, ctx.measureText(title).width + 20), 28, 14)
    ctx.fill()
    ctx.fillStyle = '#252525'
    ctx.fillText(title, 18, 27)
    let offset = 0
    for (const crop of crops) {
      const w = crop.right - crop.left
      const h = crop.bottom - crop.top
      ctx.save()
      ctx.beginPath()
      ctx.rect(offset, 48, w, h)
      ctx.clip()
      const pageImage = (index: number, alpha: number) => {
        const img = images[index]
        if (!img) return
        const ratio = img.naturalWidth / before.width
        ctx.globalAlpha = alpha
        if (index < 2) {
          ctx.filter = 'grayscale(1)'
          ctx.globalAlpha *= 0.55
        }
        ctx.drawImage(
          img,
          crop.left * ratio,
          crop.top * ratio,
          w * ratio,
          h * ratio,
          offset,
          48,
          w,
          h,
        )
        ctx.filter = 'none'
        ctx.globalAlpha = 1
      }
      if (!category) pageImage(2, 1)
      else {
        pageImage(0, 1 - progress)
        pageImage(1, progress)
        const badge = (mark: ScoredFinding, color: string, alpha: number) => {
          const guide = mark.guides[0]
          const box = mark.a.box
          const x =
            guide?.axis === 'y'
              ? (guide.from + guide.to) / 2
              : (guide?.at ?? (box.left + box.right) / 2)
          const y = guide?.axis === 'x' ? (guide.from + guide.to) / 2 : (guide?.at ?? box.top)
          if (x < crop.left || x > crop.right || y < crop.top || y > crop.bottom) return
          ctx.globalAlpha = alpha
          ctx.strokeStyle = '#1a8cff66'
          ctx.lineWidth = 1
          ctx.strokeRect(
            offset + box.left - crop.left,
            48 + box.top - crop.top,
            box.right - box.left,
            box.bottom - box.top,
          )
          if (guide) {
            ctx.beginPath()
            ctx.moveTo(
              offset + (guide.axis === 'x' ? guide.at : guide.from) - crop.left,
              48 + (guide.axis === 'y' ? guide.at : guide.from) - crop.top,
            )
            ctx.lineTo(
              offset + (guide.axis === 'x' ? guide.at : guide.to) - crop.left,
              48 + (guide.axis === 'y' ? guide.at : guide.to) - crop.top,
            )
            ctx.stroke()
          }
          const label = String(
            Number((Math.round(measuredValue(mark) * mark.dpr) / mark.dpr).toFixed(1)),
          )
          const bw = Math.max(16, label.length * 6 + 8)
          const bx = Math.max(offset, Math.min(offset + w - bw, offset + x - crop.left - bw / 2))
          const by = 48 + y - crop.top
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.roundRect(bx, by - 8, bw, 16, 8)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = '700 10px system-ui'
          ctx.textAlign = 'center'
          ctx.fillText(label, bx + bw / 2, by + 3.5)
          ctx.textAlign = 'left'
          ctx.globalAlpha = 1
        }
        for (const mark of after.rhythm ?? [])
          if (mark.step === 0 && !category.pairs.some((pair) => pair.after.id === mark.id))
            badge(mark, '#1a8cff', 0.45)
        for (const pair of category.pairs) {
          badge(pair.before, '#f24822', 1 - progress)
          badge(pair.after, '#1a8cff', progress)
        }
      }
      ctx.restore()
      offset += w
    }
    return title
  }
  return { duration, categories, render }
}
