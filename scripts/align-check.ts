import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { chromium, type Page } from 'playwright-core'
import { frameInfo, scoreFindings, skeletonMode, type ViewerPage } from './align-capture'
import { extractComponents } from './align-components'
import { writeRhythmImages } from './align-images'
import {
  type AlignFinding,
  type AlignLimits,
  drawGuides,
  measureAlignment,
  pageProblem,
  scrollToStep,
  settlePage,
} from './align-page'
import { assignFindingIds, diffRounds, nextRound, saveDiff } from './align-round'
import { measureSpacing } from './align-spacing'
import { writeViewer } from './align-viewer'

const DEFAULT_ORIGIN = 'http://localhost:5174'
const DESKTOP_WIDTH = 1440
const PHONE_WIDTH = 390
const VIEW_HEIGHT = 900
const PHONE_HEIGHT = 844
const LOAD_TIMEOUT_MS = 30_000
const MAX_SCROLL_STEPS = 8

type PageReport = ViewerPage

function stop(message: string): never {
  console.error(`✗ ${message}`)
  process.exit(2)
}

function numberOption(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) stop(`--${name} needs a number. ${value} is not a number.`)
  return parsed
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    origin: { type: 'string' },
    width: { type: 'string' },
    phone: { type: 'boolean', default: false },
    scale: { type: 'string' },
    out: { type: 'string' },
    round: { type: 'string' },
    'near-min': { type: 'string' },
    'near-max': { type: 'string' },
    'icon-max': { type: 'string' },
    'hit-target': { type: 'string' },
  },
})

const origin = values.origin ?? DEFAULT_ORIGIN
const repoRoot = process.env.THC_ROOT ?? resolve(import.meta.dirname, '..')
const paths = positionals.length > 0 ? positionals : sidebarRoutes()
const startingHead = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: repoRoot,
  encoding: 'utf8',
}).stdout.trim()
if (values.round !== undefined && values.out !== undefined) stop('Use --round or --out, not both.')
const round = values.round === undefined ? null : nextRound(resolve(values.round))
const outDir = round?.directory ?? resolve(values.out ?? join(repoRoot, '.c-runtime/logs/align'))
const spacingSource = readFileSync(join(repoRoot, 'src/tokens/token-consts.stylex.ts'), 'utf8')
const spacingBlock =
  spacingSource.split('export const space =')[1]?.split('})')[0] ??
  stop('Spacing tokens are not defined.')
const spacingTokens = [...spacingBlock.matchAll(/var\((--webapp-space-[a-z0-9-]+)\)/g)]
  .map((match) => match[1])
  .filter((name): name is string => name !== undefined)
const scale = numberOption(values.scale, 2, 'scale')
const widths = [numberOption(values.width, DESKTOP_WIDTH, 'width')]
if (values.phone) widths.push(PHONE_WIDTH)
const limits: AlignLimits = {
  nearMin: numberOption(values['near-min'], 0.5, 'near-min'),
  nearMax: numberOption(values['near-max'], 3, 'near-max'),
  iconTextMax: numberOption(values['icon-max'], 1, 'icon-max'),
  columnGap: 64,
  iconTextGap: 24,
  hitTarget: numberOption(values['hit-target'], 44, 'hit-target'),
}

function slugOf(path: string, width: number, index: number): string {
  const name = path.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'root'
  return `${index + 1}-${name}-${width}`
}

function cdpUrl(): string | null {
  const configured = process.env.ALIGN_CDP_URL
  return configured === undefined || configured === '' ? null : configured
}

function sidebarRoutes(): string[] {
  const featuresDir = join(repoRoot, 'internal/work/features')
  const routes = new Set<string>()
  for (const entry of readdirSync(featuresDir, { withFileTypes: true })) {
    const file = join(featuresDir, entry.name, 'entrypoint.ts')
    if (!entry.isDirectory() || !existsSync(file)) continue
    const source = readFileSync(file, 'utf8')
    const navAt = source.search(/\bnav:/)
    if (navAt === -1) continue
    const targets = [...source.slice(navAt).matchAll(/\bto:\s*'([^']+)'/g)].map((match) => match[1])
    const firstPath = /\bpath:\s*'([^']+)'/.exec(source)?.[1]
    for (const target of targets.length > 0 ? targets : [firstPath])
      if (target !== undefined) routes.add(target)
  }
  if (routes.size === 0) stop('No sidebar routes found in internal/work/features/*/entrypoint.ts.')
  return [...routes].sort((a, b) => a.localeCompare(b))
}

async function measure(
  page: Page,
  path: string,
  width: number,
  index: number,
): Promise<PageReport> {
  await page.goto(new URL(path, origin).toString(), {
    waitUntil: 'load',
    timeout: LOAD_TIMEOUT_MS,
  })
  await page.locator('main').first().waitFor({ timeout: LOAD_TIMEOUT_MS })
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined)
  await page.evaluate(settlePage)
  const problem = await page.evaluate(pageProblem)
  if (problem !== '') stop(`${path}: ${problem} Give a path that the app serves.`)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if ((await page.locator('[role="dialog"]').count()) === 0) break
    await page.keyboard.press('Escape')
    await page.evaluate(settlePage)
    await page.waitForTimeout(200)
  }
  if ((await page.locator('[role="dialog"]').count()) > 0)
    stop(
      `${path}: a dialog (the first-run tour) covers the page. Close it, then run ./c align again.`,
    )
  const findings: PageReport['findings'] = []
  const rhythm: PageReport['findings'] = []
  const screenshots: PageReport['screenshots'] = []
  let steps = 1
  for (let step = 0; step < steps; step += 1) {
    steps = await page.evaluate(scrollToStep, { step, maxSteps: MAX_SCROLL_STEPS })
    await page.evaluate(settlePage)
    await page.evaluate(drawGuides, [])
    const frame = {
      ...(await page.evaluate(frameInfo, step)),
      components: await page.evaluate(extractComponents),
    }
    const stepRhythm = await page.evaluate(measureSpacing, {
      tokenNames: spacingTokens,
      rhythm: true,
    })
    rhythm.push(
      ...(await page.evaluate(scoreFindings, stepRhythm)).map((finding) => ({
        ...finding,
        ...frame,
      })),
    )
    const stepFindings = [
      ...(await page.evaluate(measureAlignment, limits)),
      ...(await page.evaluate(measureSpacing, { tokenNames: spacingTokens })),
      ...stepRhythm.filter((finding) => finding.delta > 0),
    ]
    const scored = await page.evaluate(scoreFindings, stepFindings)
    const base = join(outDir, `${slugOf(path, width, index)}-${step + 1}`)
    const clean = `${base}-clean.png`
    const skeleton = `${base}-skeleton.png`
    await page.screenshot({ path: clean })
    try {
      await page.evaluate(skeletonMode, true)
      await page.screenshot({ path: skeleton })
    } finally {
      await page.evaluate(skeletonMode, false)
    }
    await page.evaluate(drawGuides, stepFindings)
    const screenshot = join(outDir, `${slugOf(path, width, index)}-${step + 1}.png`)
    await page.screenshot({ path: screenshot })
    let fullClean: string | undefined
    let fullSkeleton: string | undefined
    if (step === 0) {
      await page.evaluate(drawGuides, [])
      fullClean = `${base}-full-clean.png`
      fullSkeleton = `${base}-full-skeleton.png`
      await page.screenshot({ path: fullClean, fullPage: true })
      try {
        await page.evaluate(skeletonMode, true)
        await page.screenshot({ path: fullSkeleton, fullPage: true })
      } finally {
        await page.evaluate(skeletonMode, false)
      }
    }
    screenshots.push({ ...frame, clean, skeleton, guides: screenshot, fullClean, fullSkeleton })
    findings.push(...scored.map((finding) => ({ ...finding, ...frame })))
  }
  return { path, width, scale, screenshots, findings, rhythm }
}

async function run(): Promise<PageReport[]> {
  mkdirSync(outDir, { recursive: true })
  const remoteCdpUrl = cdpUrl()
  const browser = await (remoteCdpUrl === null
    ? chromium.launch({ channel: 'chrome' })
    : chromium.connectOverCDP(remoteCdpUrl)
  ).catch((error: unknown) =>
    stop(
      `Chromium did not start. Set ALIGN_CDP_URL to a running Chrome or install Google Chrome. ${String(error)}`,
    ),
  )
  const reports: PageReport[] = []
  try {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: width === PHONE_WIDTH ? PHONE_HEIGHT : VIEW_HEIGHT },
        deviceScaleFactor: scale,
        hasTouch: width === PHONE_WIDTH,
        isMobile: width === PHONE_WIDTH,
        ignoreHTTPSErrors: true,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      for (const [index, path] of paths.entries())
        reports.push(await measure(page, path, width, index))
      await context.close()
    }
  } finally {
    await browser.close()
  }
  return reports
}

const reports = await run()
assignFindingIds(reports)
const diff = diffRounds(reports, round?.previous ?? null)
const report = { origin, limits, startingHead, pages: reports }
writeFileSync(join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
if (round !== null) saveDiff(outDir, diff)
await writeViewer(reports, outDir, round, diff)
const imageCdp = cdpUrl()
const imageBrowser = await (imageCdp === null
  ? chromium.launch({ channel: 'chrome' })
  : chromium.connectOverCDP(imageCdp))
try {
  await writeRhythmImages(reports, outDir, imageBrowser)
} finally {
  await imageBrowser.close()
}

const checks: AlignFinding['check'][] = [
  'row',
  'column',
  'icon-text',
  'fractional',
  'hit-target',
  'spacing',
  'rhythm',
]
const lines = [
  `${'page'.padEnd(32)} ${'width'.padStart(5)} ${checks.map((check) => check.padStart(10)).join(' ')}`,
]
for (const page of reports) {
  const counts = checks.map((check) =>
    String(page.findings.filter((finding) => finding.check === check).length).padStart(10),
  )
  lines.push(`${page.path.padEnd(32)} ${String(page.width).padStart(5)} ${counts.join(' ')}`)
}
const total = reports.reduce((sum, page) => sum + page.findings.length, 0)
lines.push('', `Report: ${join(outDir, 'report.json')}`)
lines.push(`Viewer: ${join(outDir, 'viewer.html')}`)
const real = reports.reduce(
  (sum, page) => sum + page.findings.filter((finding) => finding.noiseScore < 0.5).length,
  0,
)
lines.push(`Likely real: ${real}; noise: ${total - real}`)
lines.push(
  total === 0
    ? '✓ No alignment findings.'
    : `✗ ${total} alignment findings. The screenshots show each one as red lines.`,
)
process.stdout.write(`${lines.join('\n')}\n`)
if (round !== null)
  lines.push(
    `round ${String(round.number).padStart(2, '0')}: ${diff.new.length + diff.stillOpen.length} real open, ${diff.fixed.length} fixed, ${diff.new.length} new (noise hidden: ${total - real})`,
  )
process.stdout.write(round === null ? '' : `${lines.at(-1)}\n`)
process.exit(real === 0 ? 0 : 1)
