import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { bundleClient } from './align-bundle'
import type { ScoredFinding } from './align-capture'
import type { ComparePage } from './align-compare-client'
import { readPlaybackRounds } from './align-playback-data'
import { diffRounds } from './align-round'

interface AuditNotes {
  falsePositives?: Array<{ id?: string; reason: string }>
  intended?: Array<{ id: string; reason: string }>
  changes?: Array<{
    category: string
    element: string
    before: string
    after: string
    rounds: string | string[]
  }>
}

const input = process.argv[2]
if (!input || input === '--help') {
  process.stdout.write('Usage: bun scripts/align-compare.ts <run-dir>\n')
  process.exit(input ? 0 : 2)
}
const root = resolve(input)
if (!existsSync(root)) {
  console.error('The run folder does not exist.')
  process.exit(2)
}
const rounds = readPlaybackRounds(root)
const first = rounds[0]
const last = rounds.at(-1)
if (!first || !last || first.number === last.number) {
  console.error('Give a run folder with at least two round reports.')
  process.exit(2)
}
const noteFile = join(root, 'audit.json')
const notes: AuditNotes = existsSync(noteFile) ? JSON.parse(readFileSync(noteFile, 'utf8')) : {}
const falseIds = new Set(notes.falsePositives?.map((note) => note.id))
const intended = new Map(notes.intended?.map((note) => [note.id, note.reason]))
const diff = diffRounds(last.pages, first)
const htmlText = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
const roundText = (value: string | string[]) => (Array.isArray(value) ? value.join(', ') : value)
const value = (mark: ScoredFinding, after: boolean) => {
  const size = mark.edge.match(/^size ([\d.]+)x([\d.]+)$/)
  if (size)
    return after
      ? `≥${Math.min(Number(size[1]), Number(size[2])) + mark.delta}`
      : `${size[1]}×${size[2]}`
  return String(
    after ? (mark.measurements?.expected ?? 0) : (mark.measurements?.actual ?? mark.delta),
  )
}
const fixed = diff.fixed.filter((entry) => !falseIds.has(entry.finding.id))
const _fixedIds = new Set(fixed.map((entry) => entry.finding.id))
const rows = fixed.map(
  (entry) =>
    `<li><b>${htmlText(`${entry.finding.check} · ${entry.finding.edge}`)}</b> · ${htmlText(entry.path)} · <code>${htmlText(entry.finding.identity.a)}</code>: ${htmlText(value(entry.finding, false))} → ${htmlText(value(entry.finding, true))}</li>`,
)
for (const change of notes.changes ?? [])
  rows.push(
    `<li><b>${htmlText(change.category)}</b> · ${htmlText(change.element)}: ${htmlText(change.before)} → ${htmlText(change.after)} <small>(${htmlText(roundText(change.rounds))})</small></li>`,
  )
const pages: ComparePage[] = []
const pairs = new Map<string, Array<{ round: number; page: (typeof first.pages)[number] }>>()
for (const round of rounds)
  for (const page of round.pages) {
    const key = `${page.path}:${page.width}`
    const list = pairs.get(key) ?? []
    list.push({ round: round.number, page })
    pairs.set(key, list)
  }
for (const list of pairs.values()) {
  const before = list[0]?.page
  const after = list.at(-1)?.page
  if (!before || !after) continue
  const oldShot = before.screenshots[0]
  const newShot = after.screenshots[0]
  if (!oldShot || !newShot) continue
  const pairDiff = diffRounds([after], { pages: [before] })
  const marks = (page: typeof before) =>
    [...(page.rhythm ?? []), ...page.findings.filter((mark) => mark.noiseScore < 0.5)].filter(
      (mark) => mark.step === 0 && !falseIds.has(mark.id),
    )
  pages.push({
    path: before.path,
    width: before.width,
    height: oldShot.viewport.height,
    before: oldShot.clean,
    after: newShot.clean,
    sidebar: newShot.regions?.sidebar ?? null,
    oldMarks: marks(before),
    newMarks: marks(after),
    fixed: pairDiff.fixed
      .filter((entry) => entry.finding.step === 0 && !falseIds.has(entry.finding.id))
      .map((entry) => entry.finding),
    beforeComponents: oldShot.components ?? [],
    afterComponents: newShot.components ?? [],
  })
}
if (!pages.length) {
  console.error('The first and last rounds have no matching page and width.')
  process.exit(2)
}
const repo = process.env.THC_ROOT ?? resolve(import.meta.dirname, '..')
const git = (...args: string[]) =>
  spawnSync('git', args, { cwd: repo, encoding: 'utf8' }).stdout.trim()
const base = git('merge-base', first.startingHead ?? 'origin/main', 'HEAD')
const files = git('diff', base, '--name-only', '--', 'src/')
const stat = git('diff', base, '--stat')
const script = bundleClient('align-compare-client.ts', true)
const open = new Map(
  last.pages.flatMap((page) =>
    page.findings
      .filter((mark) => mark.noiseScore < 0.5 && !falseIds.has(mark.id))
      .map((mark) => [mark.id, { path: page.path, mark }] as const),
  ),
)
const openRows = [...open.values()].map(
  ({ path, mark }) =>
    `<li>${htmlText(path)} · ${htmlText(`${mark.check} · ${mark.edge}`)} · <code>${htmlText(mark.identity.a)}</code>: ${htmlText(value(mark, false))}${intended.has(mark.id) ? ` — intended: ${htmlText(intended.get(mark.id) ?? '')}` : ' — open'}</li>`,
)
for (const note of notes.intended ?? [])
  if (!falseIds.has(note.id) && !open.has(note.id))
    openRows.push(`<li>Intended: ${htmlText(note.reason)}</li>`)
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Before / after · rounds ${first.number}–${last.number}</title><style>body{margin:0;background:#f2f2f2;color:#252525;font:14px system-ui}main{max-width:1440px;margin:auto;padding:24px}h1{font-size:24px}h2{font-size:18px}section{margin-block:24px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-block:16px}figure{margin:0;min-width:0}figcaption{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}svg{display:block;width:100%;height:auto;background:white;border-radius:8px}button{padding:8px;border:1px solid #ccc;border-radius:8px;background:white;cursor:pointer}li{margin-block:8px;overflow-wrap:anywhere}code,pre{font-size:12px}pre{padding:16px;background:white;white-space:pre-wrap}small{color:#666}.error{color:#b20}summary{cursor:pointer;font-weight:600}.legend{display:flex;gap:12px;flex-wrap:wrap}.legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><main><h1>Before / after</h1><p>Round ${first.number} → ${last.number} · clean captures · changed regions</p><p class="legend"><span><i style="background:#64748b"></i>Component</span><span><i style="background:#4f46e5"></i>Clickable-bound</span><span><i style="background:#f59e0b"></i>Clickable-gap</span></p><div id="pages">Loading captures…</div><section><h2>Audit</h2><details open><summary>Fixed · ${rows.length}</summary><ul>${rows.join('') || '<li>No fixed finding was recorded.</li>'}</ul></details><details open><summary>Open or intended · ${openRows.length}</summary><ul>${openRows.join('') || '<li>No real finding remains open.</li>'}</ul></details><details open><summary>Align false positives fixed · ${notes.falsePositives?.length ?? 0}</summary><ul>${notes.falsePositives?.map((note) => `<li>${htmlText(note.reason)}</li>`).join('') || '<li>No false-positive note was recorded.</li>'}</ul></details><p>Resolved hit targets show the minimum proved by the final check. Keep triage in <code>audit.json</code>; absence alone cannot prove intent.</p><h2>UI files changed</h2><pre>${htmlText(files || 'No UI diff against the run start.')}</pre><details><summary>Git diff stat · run start to working tree</summary><pre>${htmlText(stat)}</pre></details></section></main><script id="compare-data" type="application/json">${JSON.stringify(pages).replaceAll('<', '\\u003c')}</script><script>${script.replaceAll('</script', '<\\/script')}</script></html>`
const output = join(root, 'before-after.html')
writeFileSync(output, html)
process.stdout.write(
  `✓ Before/after: ${output} (${pages.length} page/width pairs, rounds ${first.number} → ${last.number})\n`,
)
